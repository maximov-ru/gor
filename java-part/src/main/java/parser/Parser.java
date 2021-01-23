package parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import entity.LpuEntity;
import entity.SpecialityEntity;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import model.LpuResponse;
import model.SpecialityResponse;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import repository.LpuRepository;
import repository.SpecialityRepository;
import settings.ParserSettings;

import javax.annotation.PostConstruct;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Slf4j
@Component
public class Parser {

    private volatile LocalDateTime nextSpecialityUpdate = null;
    private volatile LocalDateTime nextLpuUpdate = null;
    private volatile LocalDateTime now = null;
    private volatile LocalTime lpuUpdateTime = null;

    private final List<LpuEntity> lpus = new LinkedList<>();

    @Autowired
    private ParserSettings parserSettings;

    @Autowired
    private LpuRepository lpuRepository;

    @Autowired
    private SpecialityRepository specialityRepository;

    @Autowired
    private ExecutableQueries executableQueries;

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private OkHttpClient httpClient;

    private final Supplier<Boolean> activateUpdateSpeciality =
            () -> nextSpecialityUpdate == null || LocalDateTime.now().isAfter(nextSpecialityUpdate);
    private final Supplier<Boolean> activateUpdateLpu =
            () -> nextLpuUpdate == null || LocalDateTime.now().isAfter(nextLpuUpdate);

    @PostConstruct
    public void init() throws InterruptedException {
        val currentThread = Thread.currentThread();
        lpuUpdateTime = LocalTime.parse(parserSettings.getLpuUpdateTime());

        lpus.clear();
        lpus.addAll(lpuRepository.getCovidLpuIds());

        if (!CollectionUtils.isEmpty(lpus))
            setNextLpuUpdate();

        while (!currentThread.isInterrupted()) {
            if (activateUpdateLpu.get() && updateLpu())
                setNextLpuUpdate();
            if (activateUpdateSpeciality.get() && updateSpeciality())
                nextSpecialityUpdate = now.plusSeconds(parserSettings.getSpecialityUpdateTimePeriodInSec());

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
                    lpus.clear();
                    lpus.addAll(results.stream().filter(LpuEntity::getCovidVaccination).collect(Collectors.toList()));
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
