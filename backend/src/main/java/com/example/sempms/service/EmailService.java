package com.example.sempms.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${spring.mail.username:noreply@sempms.com}")
    private String fromEmail;

    @Async
    public void sendTaskAssignmentEmail(String toEmail, String employeeName, String taskTitle, String projectName, String dueDate) {
        try {
            Context context = new Context();
            context.setVariable("employeeName", employeeName);
            context.setVariable("taskTitle", taskTitle);
            context.setVariable("projectName", projectName != null ? projectName : "N/A");
            context.setVariable("dueDate", dueDate != null ? dueDate : "N/A");

            String htmlBody = templateEngine.process("task-assigned", context);

            if (mailSender != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject("New Task Assigned: " + taskTitle);
                helper.setText(htmlBody, true);
                mailSender.send(message);
            }
            System.out.println("[EMAIL LOG] Task Assignment notification sent to: " + toEmail + " for task: " + taskTitle);
        } catch (Exception e) {
            System.err.println("[EMAIL ERROR] Could not send task assignment email: " + e.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String username, String fullName, String role) {
        try {
            Context context = new Context();
            context.setVariable("username", username);
            context.setVariable("fullName", fullName != null ? fullName : username);
            context.setVariable("role", role);

            String htmlBody = templateEngine.process("welcome", context);

            if (mailSender != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject("Welcome to Smart Employee & Project Management System");
                helper.setText(htmlBody, true);
                mailSender.send(message);
            }
            System.out.println("[EMAIL LOG] Welcome email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("[EMAIL ERROR] Could not send welcome email: " + e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String fullName, String username, String resetLink) {
        try {
            Context context = new Context();
            context.setVariable("fullName", fullName != null ? fullName : username);
            context.setVariable("username", username);
            context.setVariable("resetLink", resetLink);

            String htmlBody = templateEngine.process("password-reset", context);

            if (mailSender != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject("Password Reset Request - Smart Management System");
                helper.setText(htmlBody, true);
                mailSender.send(message);
            }
            System.out.println("[EMAIL LOG] Password reset email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("[EMAIL ERROR] Could not send password reset email: " + e.getMessage());
        }
    }

    @Async
    public void sendProfileUpdatedEmail(String toEmail, String fullName) {
        try {
            Context context = new Context();
            context.setVariable("fullName", fullName != null ? fullName : "Employee");

            String htmlBody = templateEngine.process("profile-updated", context);

            if (mailSender != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject("Profile Photo & Details Updated");
                helper.setText(htmlBody, true);
                mailSender.send(message);
            }
            System.out.println("[EMAIL LOG] Profile update email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("[EMAIL ERROR] Could not send profile update email: " + e.getMessage());
        }
    }

    @Async
    public void sendProjectDeadlineWarningEmail(String toEmail, String recipientName, String projectName, String deadline, String status) {
        try {
            Context context = new Context();
            context.setVariable("recipientName", recipientName != null ? recipientName : "Team Member");
            context.setVariable("projectName", projectName);
            context.setVariable("deadline", deadline != null ? deadline : "N/A");
            context.setVariable("status", status != null ? status : "IN_PROGRESS");

            String htmlBody = templateEngine.process("project-deadline", context);

            if (mailSender != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject("⏰ Project Deadline Alert: " + projectName);
                helper.setText(htmlBody, true);
                mailSender.send(message);
            }
            System.out.println("[EMAIL LOG] Project deadline warning email sent to: " + toEmail + " for project: " + projectName);
        } catch (Exception e) {
            System.err.println("[EMAIL ERROR] Could not send project deadline warning email: " + e.getMessage());
        }
    }
}

