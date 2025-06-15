package com.example.chatbot.dto;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for chat responses
 */
public class ChatResponse {
    
    private String message;
    private String model;
    private LocalDateTime timestamp;
    private boolean success;
    private String error;
    
    public ChatResponse() {
        this.timestamp = LocalDateTime.now();
    }
    
    public ChatResponse(String message, String model) {
        this();
        this.message = message;
        this.model = model;
        this.success = true;
    }
    
    public static ChatResponse success(String message, String model) {
        return new ChatResponse(message, model);
    }
    
    public static ChatResponse error(String error) {
        ChatResponse response = new ChatResponse();
        response.error = error;
        response.success = false;
        return response;
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
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
}
