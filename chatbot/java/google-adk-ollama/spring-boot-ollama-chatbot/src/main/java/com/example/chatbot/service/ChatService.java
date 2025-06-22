package com.example.chatbot.service;

import com.example.chatbot.config.OllamaProperties;
import com.example.chatbot.dto.ChatRequest;
import com.example.chatbot.dto.ChatResponse;
import com.example.chatbot.model.ChatMessage;
import com.google.adk.agents.LlmAgent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Main chat service that integrates Google ADK with Ollama
 */
@Service
public class ChatService {
      private static final Logger logger = LoggerFactory.getLogger(ChatService.class);
    
    private final OllamaService ollamaService;
    private final OllamaProperties ollamaProperties;
    private final ConcurrentHashMap<String, List<ChatMessage>> chatHistory;
    
    @Autowired
    public ChatService(OllamaService ollamaService, OllamaProperties ollamaProperties) {
        this.ollamaService = ollamaService;
        this.ollamaProperties = ollamaProperties;
        this.chatHistory = new ConcurrentHashMap<>();
    }
      /**
     * Process a chat request and return a response
     */
    public Mono<ChatResponse> processMessage(ChatRequest request) {
        logger.info("Processing chat request: {}", request);
        
        String sessionId = "default"; // For simplicity, using a default session
        String model = (request.getModel() != null && !request.getModel().trim().isEmpty()) 
            ? request.getModel() 
            : ollamaProperties.getModel();
        
        logger.info("Using model: {} for request", model);
        
        // Add user message to history
        ChatMessage userMessage = ChatMessage.userMessage(request.getMessage());
        addMessageToHistory(sessionId, userMessage);
        
        // Generate response using Ollama
        return ollamaService.generateResponse(request.getMessage(), model)
                .map(response -> {
                    // Add assistant message to history
                    ChatMessage assistantMessage = ChatMessage.assistantMessage(response, model);
                    addMessageToHistory(sessionId, assistantMessage);
                    
                    return ChatResponse.success(response, model);
                })
                .onErrorReturn(ChatResponse.error("Sorry, I encountered an error processing your message."));
    }
    
    /**
     * Get chat history for a session
     */
    public List<ChatMessage> getChatHistory(String sessionId) {
        return chatHistory.getOrDefault(sessionId, new ArrayList<>());
    }
    
    /**
     * Clear chat history for a session
     */
    public void clearChatHistory(String sessionId) {
        chatHistory.remove(sessionId);
        logger.info("Cleared chat history for session: {}", sessionId);
    }
      /**
     * Create an ADK agent (for future enhancements)
     */
    public LlmAgent createAgent(String name, String model) {
        try {
            return LlmAgent.builder()
                    .name(name)
                    .description("A helpful chatbot assistant")
                    .model(model)
                    .instruction("You are a helpful assistant. Answer questions clearly and concisely.")
                    .build();
        } catch (Exception e) {
            logger.error("Error creating ADK agent", e);
            return null;
        }
    }
    
    /**
     * Check Ollama health status
     */
    public Mono<Boolean> checkOllamaHealth() {
        return ollamaService.isOllamaRunning();
    }
    
    /**
     * Get available models from Ollama
     */
    public Mono<String> getAvailableModels() {
        return ollamaService.getAvailableModels();
    }
    
    private void addMessageToHistory(String sessionId, ChatMessage message) {
        chatHistory.computeIfAbsent(sessionId, k -> new ArrayList<>()).add(message);
    }
}
