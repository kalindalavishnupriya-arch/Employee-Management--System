package com.example.sempms.service;

import com.example.sempms.dto.EmployeeDto;
import com.example.sempms.model.Employee;
import com.example.sempms.repository.EmployeeRepository;
import com.example.sempms.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private EmployeeService employeeService;

    private Employee sampleEmployee;
    private EmployeeDto sampleDto;

    @BeforeEach
    void setUp() {
        sampleEmployee = Employee.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .department("Engineering")
                .designation("Senior Developer")
                .status("Active")
                .joinedDate(LocalDate.now())
                .build();

        sampleDto = EmployeeDto.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .department("Engineering")
                .designation("Senior Developer")
                .status("Active")
                .build();
    }

    @Test
    void saveEmployee_Success() {
        when(employeeRepository.existsByEmail("john.doe@example.com")).thenReturn(false);
        when(employeeRepository.save(any(Employee.class))).thenReturn(sampleEmployee);

        EmployeeDto result = employeeService.save(sampleDto);

        assertNotNull(result);
        assertEquals("John", result.getFirstName());
        assertEquals("john.doe@example.com", result.getEmail());
        verify(auditLogService, times(1)).log(eq("CREATE"), eq("EMPLOYEE"), any(), any());
    }

    @Test
    void saveEmployee_DuplicateEmail_ThrowsException() {
        when(employeeRepository.existsByEmail("john.doe@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> employeeService.save(sampleDto));
        verify(employeeRepository, never()).save(any());
    }

    @Test
    void findById_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));

        EmployeeDto result = employeeService.findById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Doe", result.getLastName());
    }

    @Test
    void delete_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));
        doNothing().when(employeeRepository).deleteById(1L);

        assertDoesNotThrow(() -> employeeService.delete(1L));
        verify(employeeRepository, times(1)).deleteById(1L);
        verify(auditLogService, times(1)).log(eq("DELETE"), eq("EMPLOYEE"), eq(1L), any());
    }

    @Test
    void updateProfile_AdminAccess_SendsEmail() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));
        when(employeeRepository.save(any(Employee.class))).thenReturn(sampleEmployee);

        EmployeeDto updatedDto = EmployeeDto.builder()
                .firstName("John")
                .lastName("Updated")
                .email("john.doe@example.com")
                .build();

        EmployeeDto result = employeeService.update(1L, updatedDto, "adminUser", true);

        assertNotNull(result);
        verify(emailService, times(1)).sendProfileUpdatedEmail(eq("john.doe@example.com"), any());
    }
}
