package com.example.shop.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {
    @Value("${file.upload-dir}")
    private String uploadDir;

    public String storeImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;
        Path dir = Paths.get(uploadDir).toAbsolutePath();
        Files.createDirectories(dir);
        String ext = extractExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + (ext != null ? "." + ext : "");
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target);
        return "/uploads/" + filename;
    }

    private String extractExtension(String name) {
        if (name == null) return null;
        int i = name.lastIndexOf('.');
        if (i >= 0 && i < name.length() - 1) return name.substring(i + 1);
        return null;
    }
}
