package model;

import entity.SpecialityEntity;
import lombok.Data;

import java.util.Collection;

@Data
public class SpecialityResponse {
    private Collection<SpecialityEntity> result;
}
