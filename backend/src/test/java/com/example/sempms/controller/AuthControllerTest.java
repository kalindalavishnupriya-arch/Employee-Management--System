package com.example.sempms.controller;

import com.example.sempms.dto.AuthRequest;
import com.example.sempms.dto.AuthResponse;
import com.example.sempms.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;

    @Test
    void login_Success() {
        AuthRequest request = new AuthRequest("admin", "password");
        AuthResponse mockResponse = AuthResponse.builder()
                .token("mock-jwt-token")
                .username("admin")
                .role("ROLE_ADMIN")
                .build();

        when(userService.authenticate(any(AuthRequest.class))).thenReturn(mockResponse);

        ResponseEntity<AuthResponse> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("mock-jwt-token", response.getBody().getToken());
        assertEquals("ROLE_ADMIN", response.getBody().getRole());
    }
}
