package com.metrologix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LegalMetrixApplication {

    public static void main(String[] args) {
        SpringApplication.run(LegalMetrixApplication.class, args);
    }
}
