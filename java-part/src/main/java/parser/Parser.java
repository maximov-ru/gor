package parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import entity.DistrictEntity;
import entity.LpuEntity;
import entity.SpecialityEntity;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import model.LpuResponse;
import model.SpecialityChanges;
import model.SpecialityResponse;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import repository.DistrictRepository;
import repository.LpuRepository;
import repository.SpecialityRepository;
import settings.ParserSettings;

import javax.annotation.PostConstruct;
import javax.mail.Address;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Slf4j
@Component
public class Parser {

    private volatile LocalDateTime nextSpecialityUpdate = null;
    private volatile LocalDateTime nextLpuUpdate = null;
    private volatile LocalDateTime now = null;
    private volatile LocalTime lpuUpdateTime = null;
    private volatile Map<Integer, LpuEntity> idToLpuMap = new HashMap<>();
    private volatile Map<Integer, DistrictEntity> idToDistrictMap = new HashMap<>();

    private List<LpuEntity> lpus = new LinkedList<>();
    private List<SpecialityEntity> lastSpeciality;

    @Autowired
    private ParserSettings parserSettings;

    @Autowired
    private LpuRepository lpuRepository;

    @Autowired
    private SpecialityRepository specialityRepository;

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private ExecutableQueries executableQueries;

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private OkHttpClient httpClient;

    @Autowired
    private JavaMailSender mailSender;

    private final Supplier<Boolean> activateUpdateSpeciality =
            () -> nextSpecialityUpdate == null || LocalDateTime.now().isAfter(nextSpecialityUpdate);
    private final Supplier<Boolean> activateUpdateLpu =
            () -> nextLpuUpdate == null || LocalDateTime.now().isAfter(nextLpuUpdate);

    @PostConstruct
    public void init() throws InterruptedException, MessagingException {
        idToDistrictMap = districtRepository.findAll().stream().collect(Collectors.toMap(DistrictEntity::getId, x -> x));

        val currentThread = Thread.currentThread();
        lpuUpdateTime = LocalTime.parse(parserSettings.getLpuUpdateTime());

        lpus = lpuRepository.getCovidLpuIds().stream().filter(LpuEntity::getCovidVaccination).collect(Collectors.toList());
        idToLpuMap = lpus.stream().collect(Collectors.toMap(LpuEntity::getId, x -> x));

        setNextLpuUpdate();

        while (!currentThread.isInterrupted()) {
            if (activateUpdateLpu.get() && updateLpu())
                setNextLpuUpdate();
            if (activateUpdateSpeciality.get() && updateSpeciality())
                nextSpecialityUpdate = now.plusSeconds(parserSettings.getSpecialityUpdateTimePeriodInSec());

            if (nextSpecialityUpdate != null)
                activateTimeout();
        }
    }

    protected synchronized boolean updateSpeciality() {
        log.info("Update speciality started");
        now = LocalDateTime.now();

        List<SpecialityEntity> specialities = new LinkedList<>();

        try {
            for (val lpu : lpus) {
                Request request = new Request.Builder()
                        .url("https://gorzdrav.spb.ru/_api/api/lpu/" + lpu.getId() + "/speciality")
                        .build();

                Response response = httpClient.newCall(request).execute();

                if (response.body() != null) {
                    val results = mapper.readValue(response.body().byteStream(), SpecialityResponse.class).getResult();
                    if (results != null) {
                        results.forEach(x -> x.setLpuId(lpu.getId()));
                        specialities.addAll(results);
                    }
                }

                Thread.sleep(100);
            }

            if (lastSpeciality == null)
                lastSpeciality = specialityRepository.findAll();

            sendNotification(lastSpeciality, specialities);

            lastSpeciality = specialities;
            saveSpeciality(specialities);
        } catch (Exception e) {
            log.error("update speciality failed", e);
            return false;
        }
        log.info("Update speciality finished successfully");
        return true;
    }

    protected boolean updateLpu() {
        log.info("Update lpu started");
        try {
            Request request = new Request.Builder()
                    .url("https://gorzdrav.spb.ru/_api/api/lpu")
                    .build();

            Response response = httpClient.newCall(request).execute();

            if (response.body() != null) {
                val results = mapper.readValue(response.body().byteStream(), LpuResponse.class).getResult();
                if (results != null) {
                    lpus = results.stream().filter(LpuEntity::getCovidVaccination).collect(Collectors.toList());
                    idToLpuMap = lpus.stream().collect(Collectors.toMap(LpuEntity::getId, x -> x));
                    saveLpu(results);
                }
            }
        } catch (Exception e) {
            log.error("update lpu failed", e);
            return false;
        }
        log.info("Update lpu finished successfully");
        return true;
    }

    @Transactional
    public void saveLpu(Collection<LpuEntity> entities) {
        executableQueries.truncateLpu();
        lpuRepository.saveAll(entities);
    }

    @Transactional
    protected synchronized void saveSpeciality(Collection<SpecialityEntity> entities) {
        executableQueries.truncateSpeciality();
        specialityRepository.saveAll(entities);
    }


    private synchronized void sendNotification(List<SpecialityEntity> last, List<SpecialityEntity> updated) throws MessagingException {
        List<SpecialityChanges> changes = new LinkedList<>();
        updated.forEach(u -> {
            val match = last.stream().filter(x -> Objects.equals(x.getLpuId(), u.getLpuId()) && Objects.equals(x.getFerId(), u.getFerId())).findFirst();
            val lpu = idToLpuMap.get(u.getLpuId());
            val lastCount = match.isPresent() ? match.get().getCountFreeParticipant() : 0;
            if (lastCount != u.getCountFreeParticipant()) {
                val change = new SpecialityChanges();
                change.setLpuId(u.getLpuId());
                change.setDistrictId(lpu.getDistrictId());
                change.setLpuName(lpu.getLpuShortName());
                change.setServiceName(u.getName());
                change.setLastCount(lastCount);
                change.setUpdatedCount(u.getCountFreeParticipant());
                changes.add(change);
            }
        });
        val removed = last.stream().filter(x -> updated.stream().allMatch(y -> !Objects.equals(x.getLpuId(), y.getLpuId()) && !Objects.equals(x.getFerId(), y.getFerId()))).collect(Collectors.toList());
        removed.forEach(r -> {
            val lpu = idToLpuMap.get(r.getLpuId());
            val change = new SpecialityChanges();
            change.setLpuId(r.getLpuId());
            change.setDistrictId(lpu.getDistrictId());
            change.setLpuName(lpu.getLpuShortName());
            change.setServiceName(r.getName());
            change.setLastCount(r.getCountFreeParticipant());
            change.setUpdatedCount(0);
            changes.add(change);
        });

        if (changes.size() != 0) {
            MimeMessage message = mailSender.createMimeMessage();
            message.setFrom("info@covvac.com");
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse("aleorlov@gmail.com, maximov@danechka.com"));
            message.setSubject("Изменения в поликниниках");
            StringBuilder sb = new StringBuilder("<html><body>");
            val groupped = changes.stream().filter(x -> StringUtils.isNotBlank(x.getServiceName()) && x.getServiceName().toLowerCase().contains("cov")).collect(Collectors.groupingBy(SpecialityChanges::getRefId));
            groupped.forEach((y, z) -> {
                sb.append("<h2>Услуга <b>\"").append(z.get(0).getServiceName()).append("\"</b></h2>")
                        .append("<table><tr><td>Район</td><td>ЛПУ</td><td>Кол-во номерков</td></tr>");
                z.forEach(x -> {
                    sb.append("<tr><td>").append(idToDistrictMap.get(x.getDistrictId()).getName())
                            .append("</td><td><a href=\"https://gorzdrav.spb.ru/service-covid-vaccination-schedule#%5B%7B%22district%22:%22")
                            .append(x.getDistrictId()).append("%22%7D,%7B%22lpu%22:%22").append(x.getLpuId())
                            .append("%22%7D%5D\">").append(x.getLpuName())
                            .append("</a></td><td>").append(x.getLastCount()).append(" -> ")
                            .append(x.getUpdatedCount()).append("</td></tr>");
                });
                sb.append("</table>");
            });
            sb.append("</body></html>");
            message.setText(sb.toString(), "utf-8", "html");
            mailSender.send(message);
        }
    }

    private synchronized void setNextLpuUpdate() {
        if (nextLpuUpdate == null)
            nextLpuUpdate = LocalDateTime.of(LocalDate.now(), lpuUpdateTime);
        if (nextLpuUpdate.isBefore(LocalDateTime.now())) {
            nextLpuUpdate = nextLpuUpdate.plusDays(1);
        }
    }

    private synchronized void activateTimeout() throws InterruptedException {
        val nextUpdate = nextLpuUpdate.isBefore(nextSpecialityUpdate) ? nextLpuUpdate : nextSpecialityUpdate;
        long millis = Duration.between(LocalDateTime.now(), nextUpdate).toMillis();
        if (millis > 0)
            Thread.sleep(millis);
    }
}
