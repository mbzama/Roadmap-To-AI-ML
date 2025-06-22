package com.example.chatbot.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatRequest {
    
    @NotBlank(message = "Message cannot be empty")
    private String message;
    
    private String model;
    
    public ChatRequest() {}
    
    public ChatRequest(String message, String model) {
        this.message = message;
        this.model = model;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getModel() {
        return model;
    }
    
    public void setModel(String model) {
        this.model = model;
    }
    
    @Override
    public String toString() {
        return "ChatRequest{" +
                "message='" + message + '\'' +
                ", model='" + model + '\'' +
                '}';
    }
}
