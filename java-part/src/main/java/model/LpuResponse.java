package model;

import entity.LpuEntity;
import lombok.Data;

import java.util.Collection;

@Data
public class LpuResponse {
    private Collection<LpuEntity> result;
}
