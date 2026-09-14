package org.example.raizrealtors.config;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class DatabaseHealthController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/api/health/db")
    public String databaseHealth() {
        jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        return "DB OK";
    }
}