package settings;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "parser")
public class ParserSettings {
    private long specialityUpdateTimePeriodInSec;

    private String lpuUpdateTime;
}
