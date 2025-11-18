package com.advice.team1.backend.common.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix="fx")
@Getter
@Setter
public class FxProperties {
    private String url;
    private String apiKey;
}
