package com.youssef.karaokecoach.media.service;

import com.youssef.karaokecoach.media.dto.MediaUploadResponse;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class MediaStorageService {

    private final Path uploadRoot = Path.of("uploads", "karaoke-media");

    public MediaUploadResponse store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        try {
            Files.createDirectories(uploadRoot);

            String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "media" : file.getOriginalFilename());
            String extension = "";
            int extensionStart = originalName.lastIndexOf('.');
            if (extensionStart >= 0) {
                extension = originalName.substring(extensionStart);
            }

            String savedFileName = UUID.randomUUID() + extension;
            Path target = uploadRoot.resolve(savedFileName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            return new MediaUploadResponse(
                    "/media/" + savedFileName,
                    file.getContentType(),
                    originalName
            );
        } catch (IOException exception) {
            throw new RuntimeException("Failed to store uploaded media", exception);
        }
    }
}
