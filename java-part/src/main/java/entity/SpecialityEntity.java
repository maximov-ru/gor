package entity;

import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "speciality")
public class SpecialityEntity {

    @Id
    @Column
    private String id;

    @Column(name = "fer_id")
    private String ferId;

    @Column(name = "count_free_participant")
    private Integer countFreeParticipant;

    @Column(name = "count_free_ticket")
    private Integer countFreeTicket;

    @Column(name = "last_date")
    private String lastDate;

    @Column(name = "nearest_date")
    private String nearestDate;

    @Column
    private String name;

    @Column(name = "lpu_id")
    private Integer lpuId;
}
