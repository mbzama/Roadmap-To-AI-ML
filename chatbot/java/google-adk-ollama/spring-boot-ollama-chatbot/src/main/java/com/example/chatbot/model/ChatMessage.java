package com.example.chatbot.model;

import java.time.LocalDateTime;

/**
 * Model class representing a chat message
 */
public class ChatMessage {
    
    private String id;
    private String content;
    private String role; // "user" or "assistant"
    private String model;
    private LocalDateTime timestamp;
    
    public ChatMessage() {
        this.timestamp = LocalDateTime.now();
    }
    
    public ChatMessage(String content, String role) {
        this();
        this.content = content;
        this.role = role;
    }
    
    public ChatMessage(String content, String role, String model) {
        this(content, role);
        this.model = model;
    }
    
    public static ChatMessage userMessage(String content) {
        return new ChatMessage(content, "user");
    }
    
    public static ChatMessage assistantMessage(String content, String model) {
        return new ChatMessage(content, "assistant", model);
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
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
    
    @Override
    public String toString() {
        return "ChatMessage{" +
                "id='" + id + '\'' +
                ", content='" + content + '\'' +
                ", role='" + role + '\'' +
                ", model='" + model + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
