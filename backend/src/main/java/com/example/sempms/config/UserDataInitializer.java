package com.example.sempms.config;

import com.example.sempms.model.Employee;
import com.example.sempms.model.User;
import com.example.sempms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class UserDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    public UserDataInitializer(UserRepository userRepository, JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Reorder MySQL table columns into clean sequential order
        try {
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN first_name VARCHAR(255) AFTER role");
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN last_name VARCHAR(255) AFTER first_name");
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN email VARCHAR(255) AFTER last_name");
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN department VARCHAR(255) AFTER email");
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN designation VARCHAR(255) AFTER department");
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN joined_date DATE AFTER designation");
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN status VARCHAR(50) AFTER joined_date");
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN employee_id BIGINT AFTER status");
        } catch (Exception ignored) {
        }

        // Backfill null profile fields from linked employee records and set a default known password
        List<User> users = userRepository.findAll();
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String defaultHashedPassword = encoder.encode("Password123");

        for (User user : users) {
            boolean updated = false;

            // Reset passwords of Priya and Vishnu to a known password "Password123"
            if ("Priya".equalsIgnoreCase(user.getUsername()) || "Vishnu".equalsIgnoreCase(user.getUsername())) {
                user.setPassword(defaultHashedPassword);
                updated = true;
            }

            Employee emp = user.getEmployee();
            if (emp != null) {
                if (user.getFirstName() == null && emp.getFirstName() != null) {
                    user.setFirstName(emp.getFirstName());
                    updated = true;
                }
                if (user.getLastName() == null && emp.getLastName() != null) {
                    user.setLastName(emp.getLastName());
                    updated = true;
                }
                if (user.getEmail() == null && emp.getEmail() != null) {
                    user.setEmail(emp.getEmail());
                    updated = true;
                }
                if (user.getDepartment() == null && emp.getDepartment() != null) {
                    user.setDepartment(emp.getDepartment());
                    updated = true;
                }
                if (user.getDesignation() == null && emp.getDesignation() != null) {
                    user.setDesignation(emp.getDesignation());
                    updated = true;
                }
                if (user.getJoinedDate() == null && emp.getJoinedDate() != null) {
                    user.setJoinedDate(emp.getJoinedDate());
                    updated = true;
                }
                if (user.getStatus() == null && emp.getStatus() != null) {
                    user.setStatus(emp.getStatus());
                    updated = true;
                }
            }

            if (updated) {
                userRepository.save(user);
            }
        }
    }
}
