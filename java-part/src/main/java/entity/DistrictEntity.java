package entity;

import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "district")
public class DistrictEntity {

    @Id
    @Column
    private Integer id;

    @Column
    private String name;

    @Column
    private Integer okato;
}
