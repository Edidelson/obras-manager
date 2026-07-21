package com.obramanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ObraManagerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ObraManagerApplication.class, args);
    }
}
