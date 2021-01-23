package repository;

import entity.LpuEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LpuRepository extends JpaRepository<LpuEntity, Integer> {

    @Query(value = "Select * from lpu where is_covid_vaccination = true", nativeQuery = true)
    List<LpuEntity> getCovidLpuIds();
}
