package com.example.chatbot.controller;

import com.example.chatbot.dto.ChatRequest;
import com.example.chatbot.dto.ChatResponse;
import com.example.chatbot.model.ChatMessage;
import com.example.chatbot.service.ChatService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Web controller for handling chat interactions
 */
@Controller
public class ChatController {
    
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    
    private final ChatService chatService;
    
    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }
    
    /**
     * Display the main chat page
     */
    @GetMapping("/")
    public String chatPage(Model model) {
        model.addAttribute("chatRequest", new ChatRequest());
        model.addAttribute("chatHistory", chatService.getChatHistory("default"));
        return "chat";
    }
    
    /**
     * Handle chat form submission
     */
    @PostMapping("/chat")
    public Mono<String> sendMessage(@Valid @ModelAttribute ChatRequest chatRequest, 
                                   BindingResult bindingResult, 
                                   Model model) {
        
        if (bindingResult.hasErrors()) {
            model.addAttribute("chatHistory", chatService.getChatHistory("default"));
            return Mono.just("chat");
        }
        
        return chatService.processMessage(chatRequest)
                .map(response -> {
                    model.addAttribute("chatRequest", new ChatRequest());
                    model.addAttribute("chatHistory", chatService.getChatHistory("default"));
                    model.addAttribute("lastResponse", response);
                    return "chat";
                });
    }
    
    /**
     * REST API endpoint for chat messages
     */
    @PostMapping("/api/chat")
    @ResponseBody
    public Mono<ChatResponse> sendMessageApi(@Valid @RequestBody ChatRequest chatRequest) {
        logger.info("Received API chat request: {}", chatRequest);
        return chatService.processMessage(chatRequest);
    }
    
    /**
     * Get chat history via REST API
     */
    @GetMapping("/api/chat/history")
    @ResponseBody
    public List<ChatMessage> getChatHistory(@RequestParam(defaultValue = "default") String sessionId) {
        return chatService.getChatHistory(sessionId);
    }
    
    /**
     * Clear chat history
     */
    @DeleteMapping("/api/chat/history")
    @ResponseBody
    public String clearChatHistory(@RequestParam(defaultValue = "default") String sessionId) {
        chatService.clearChatHistory(sessionId);
        return "Chat history cleared";
    }
      /**
     * Health check endpoint
     */
    @GetMapping("/health")
    @ResponseBody
    public Mono<String> health() {
        return chatService.checkOllamaHealth()
                .map(isHealthy -> isHealthy ? 
                    "✅ Chatbot service is running and Ollama is available!" : 
                    "⚠️ Chatbot service is running but Ollama is not available")
                .onErrorReturn("❌ Chatbot service is running but there are connection issues");
    }
    
    /**
     * Get available models endpoint
     */
    @GetMapping("/api/models")
    @ResponseBody
    public Mono<String> getModels() {
        return chatService.getAvailableModels()
                .onErrorReturn("{\"error\":\"Could not retrieve models\"}");
    }
}
