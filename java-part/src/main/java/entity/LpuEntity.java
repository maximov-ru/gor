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
    private Integer id;

    @Column
    private String description;

    @Column(name = "district_id")
    private Integer districtId;

    @Column(name = "full_name")
    private String lpuFullName;

    @Column(name = "short_name")
    private String lpuShortName;

    @Column
    private String address;

    @Column
    private String phone;

    @Column
    private String email;

    @Column
    private Double longitude;

    @Column(name = "latitude")
    private Double latitide;

    @Column(name = "covid_vaccination")
    private Boolean covidVaccination;

}
