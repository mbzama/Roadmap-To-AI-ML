package com.example.chatbot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Configuration class for Ollama integration
 * Sets up WebClient for communicating with local Ollama instance
 */
@Configuration
public class OllamaConfig {
    
    @Value("${ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;
    
    @Value("${ollama.model:llama2}")
    private String defaultModel;
    
    @Bean
    public WebClient ollamaWebClient() {
        return WebClient.builder()
                .baseUrl(ollamaBaseUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
    
    public String getDefaultModel() {
        return defaultModel;
    }
    
    public String getOllamaBaseUrl() {
        return ollamaBaseUrl;
    }
}
