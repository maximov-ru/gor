package entity;

import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "lpu")
public class LpuEntity {

    @Id
    @Column
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column
    private String description;

    @Column(name = "district_id")
    private Integer districtId;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "short_name")
    private String shortName;

    @Column
    private String address;

    @Column
    private String phone;

    @Column
    private String email;

    @Column
    private Double longitude;

    @Column
    private Double latitude;

    @Column(name = "is_covid_vaccination")
    private Boolean isCovidVaccination;

}
