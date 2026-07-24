package com.example.sempms.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for FileStorageService.
 * Uses a @TempDir to avoid polluting the real upload folder.
 */
class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService(tempDir.toAbsolutePath().toString());
    }

    @Test
    void storeFile_ValidImage_ReturnsUniqueFilename() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "profile.jpg",
                "image/jpeg",
                "fake-image-bytes".getBytes()
        );

        String storedName = fileStorageService.storeFile(file);

        assertNotNull(storedName);
        assertTrue(storedName.endsWith(".jpg"), "Stored file should preserve extension");
        assertNotEquals("profile.jpg", storedName, "Stored filename should be UUID-based, not original");
    }

    @Test
    void storeFile_NoExtension_ReturnsFilenameWithoutExtension() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar",
                "image/png",
                "fake-image-bytes".getBytes()
        );

        String storedName = fileStorageService.storeFile(file);

        assertNotNull(storedName);
        assertFalse(storedName.isEmpty());
    }

    @Test
    void storeAndLoad_RoundTrip_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "photo.png",
                "image/png",
                "hello-photo".getBytes()
        );

        String storedName = fileStorageService.storeFile(file);
        var resource = fileStorageService.loadFileAsResource(storedName);

        assertTrue(resource.exists(), "Stored file should be loadable");
        assertEquals(storedName, resource.getFilename());
    }

    @Test
    void loadFileAsResource_NonExistentFile_ThrowsException() {
        assertThrows(RuntimeException.class,
                () -> fileStorageService.loadFileAsResource("non-existent-uuid.jpg"),
                "Should throw when file does not exist"
        );
    }

    @Test
    void storeFile_LargePayload_StoredSuccessfully() {
        byte[] payload = new byte[1024 * 1024]; // 1MB
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "large-photo.jpg",
                "image/jpeg",
                payload
        );

        String storedName = fileStorageService.storeFile(file);

        assertNotNull(storedName);
        assertTrue(storedName.endsWith(".jpg"));
    }
}
