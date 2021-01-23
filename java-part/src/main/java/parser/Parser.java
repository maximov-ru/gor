package parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import entity.SpecialityEntity;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import model.SpecialityResponse;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import repository.LpuRepository;
import repository.SpecialityRepository;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.text.ParseException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

@Slf4j
@Component
public class Parser {

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


    @PostConstruct
    public void init() throws IOException, InterruptedException, ParseException {
        val now = LocalDateTime.now();
        val lpus = lpuRepository.getCovidLpuIds();
        List<SpecialityEntity> specialities = new LinkedList<>();

        for (val lpu : lpus) {
            Request request = new Request.Builder()
                    .url("https://gorzdrav.spb.ru/_api/api/lpu/" + lpu.getId() + "/speciality")
                    .build();

            Response response = httpClient.newCall(request).execute();

            val results = mapper.readValue(response.body().byteStream(), SpecialityResponse.class).getResult();
            if (results != null) {
                results.forEach(x -> {
                    x.setLpuId(lpu.getId());
                    x.setLastUpdate(now);
                });
                specialities.addAll(results);
            }

            Thread.sleep(100);
        }

        SaveSpeciality(specialities);
    }

    @Transactional
    public void SaveSpeciality(Collection<SpecialityEntity> entities) {
        executableQueries.truncateSpeciality();
        specialityRepository.saveAll(entities);
    }
}
