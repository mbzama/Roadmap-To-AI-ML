package com.example.chatbot.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for Ollama integration
 */
@Component
@ConfigurationProperties(prefix = "ollama")
public class OllamaProperties {
    
    private String baseUrl = "http://localhost:11434";
    private String model = "tinyllama";
    
    public String getBaseUrl() {
        return baseUrl;
    }
    
    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    public String getModel() {
        return model;
    }
    
    public void setModel(String model) {
        this.model = model;
    }
}
