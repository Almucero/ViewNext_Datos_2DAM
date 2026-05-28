package com.hivefive.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Arranque de Spring Boot para la API HiveFive.
 */
@SpringBootApplication(scanBasePackages = "com.hivefive")
@EntityScan(basePackages = "com.hivefive")
@EnableJpaRepositories(basePackages = "com.hivefive")
public class HivefiveApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(HivefiveApiApplication.class, args);
    }
}
