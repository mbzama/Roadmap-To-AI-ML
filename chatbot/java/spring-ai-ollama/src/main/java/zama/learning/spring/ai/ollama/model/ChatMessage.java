package zama.learning.spring.ai.ollama.model;

import jakarta.validation.constraints.NotBlank;

public class ChatMessage {
    
    @NotBlank(message = "Message cannot be empty")
    private String message;
    
    private String response;
    
    public ChatMessage() {}
    
    public ChatMessage(String message) {
        this.message = message;
    }
    
    public ChatMessage(String message, String response) {
        this.message = message;
        this.response = response;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getResponse() {
        return response;
    }
    
    public void setResponse(String response) {
        this.response = response;
    }
}
