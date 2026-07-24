package com.example.sempms.service;

import com.example.sempms.model.Employee;
import com.example.sempms.model.PasswordResetToken;
import com.example.sempms.model.User;
import com.example.sempms.repository.EmployeeRepository;
import com.example.sempms.repository.PasswordResetTokenRepository;
import com.example.sempms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public PasswordResetService(UserRepository userRepository,
                                EmployeeRepository employeeRepository,
                                PasswordResetTokenRepository tokenRepository,
                                EmailService emailService,
                                PasswordEncoder passwordEncoder,
                                AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public void requestPasswordReset(String email) {
        // Look up employee by email to find the linked user
        Optional<Employee> empOpt = employeeRepository.findByEmail(email);
        if (empOpt.isEmpty()) {
            // Silently return to prevent email enumeration attacks
            return;
        }

        Employee emp = empOpt.get();
        Optional<User> userOpt = userRepository.findByEmployeeId(emp.getId());
        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();

        // Invalidate any existing tokens for this user
        tokenRepository.deleteAllByUserId(user.getId());

        // Generate a secure token (expires in 30 minutes)
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .used(false)
                .build();
        tokenRepository.save(resetToken);

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(email, emp.getFirstName() + " " + emp.getLastName(), user.getUsername(), resetLink);

        auditLogService.log("REQUEST", "PASSWORD_RESET", user.getId(),
                "Password reset requested for user: " + user.getUsername());
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset link. Please request a new one."));

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("This reset link has already been used. Please request a new one.");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This reset link has expired. Please request a new one.");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        auditLogService.log("UPDATE", "PASSWORD_RESET", user.getId(),
                "Password successfully reset for user: " + user.getUsername());
    }
}
