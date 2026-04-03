package com.youssef.karaokecoach.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class StaticMediaConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Path.of("uploads", "karaoke-media").toAbsolutePath().toUri().toString();
        registry.addResourceHandler("/media/**")
                .addResourceLocations(location);
    }
}
