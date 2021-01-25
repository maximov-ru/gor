package model;

import lombok.Data;

@Data
public class SpecialityChanges {
    private int lpuId;
    private int districtId;
    private String lpuName;
    private int lastCount;
    private int updatedCount;
    private String serviceName;
    private int refId;
}
