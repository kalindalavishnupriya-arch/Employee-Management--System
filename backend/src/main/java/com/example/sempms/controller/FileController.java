package com.example.sempms.controller;

import com.example.sempms.dto.EmployeeDto;
import com.example.sempms.service.EmployeeService;
import com.example.sempms.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/files")
@Tag(name = "File Management", description = "Endpoints for profile image upload and serving")
public class FileController {

    private final FileStorageService fileStorageService;
    private final EmployeeService employeeService;

    public FileController(FileStorageService fileStorageService, EmployeeService employeeService) {
        this.fileStorageService = fileStorageService;
        this.employeeService = employeeService;
    }

    @PostMapping("/upload-profile/{employeeId}")
    @Operation(summary = "Upload profile picture for an employee")
    public ResponseEntity<EmployeeDto> uploadProfileImage(
            @PathVariable Long employeeId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : null;
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        String filename = fileStorageService.storeFile(file);
        EmployeeDto updated = employeeService.updateProfileImage(employeeId, filename, username, isAdmin);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/profile/{filename:.+}")
    @Operation(summary = "Get/Serve profile picture by filename")
    public ResponseEntity<Resource> getProfileImage(@PathVariable String filename, HttpServletRequest request) {
        Resource resource = fileStorageService.loadFileAsResource(filename);
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // fallback
        }
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
