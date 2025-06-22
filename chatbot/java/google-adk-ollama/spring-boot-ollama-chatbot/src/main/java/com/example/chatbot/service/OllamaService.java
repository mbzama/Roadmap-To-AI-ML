package com.example.chatbot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

/**
 * Service class for interacting with Ollama API
 */
@Service
public class OllamaService {
    
    private static final Logger logger = LoggerFactory.getLogger(OllamaService.class);
    
    private final WebClient ollamaWebClient;
    private final ObjectMapper objectMapper;
    
    @Autowired
    public OllamaService(WebClient ollamaWebClient) {
        this.ollamaWebClient = ollamaWebClient;
        this.objectMapper = new ObjectMapper();
    }
      /**
     * Generate a response from Ollama using the specified model
     */
    public Mono<String> generateResponse(String prompt, String model) {
        logger.info("Generating response with model: {} for prompt: {}", model, prompt);
        
        // First check if the model is available
        return isModelAvailable(model)
                .flatMap(available -> {
                    if (!available) {
                        logger.warn("Model {} is not available, attempting to pull it", model);
                        return pullModel(model)
                                .then(Mono.defer(() -> generateWithModel(prompt, model)));
                    } else {
                        return generateWithModel(prompt, model);
                    }
                })
                .onErrorResume(error -> {
                    logger.error("Error in generateResponse for model: {} with prompt: {}", model, prompt, error);
                    return Mono.just("I apologize, but I'm currently unable to process your request. Please ensure Ollama is running with the '" + model + "' model available. Error: " + error.getMessage());
                });
    }
    
    private Mono<String> generateWithModel(String prompt, String model) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("prompt", prompt);
        requestBody.put("stream", false);
        
        return ollamaWebClient
                .post()
                .uri("/api/generate")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::extractResponse)
                .doOnSuccess(response -> logger.info("Successfully generated response with model: {}", model))
                .doOnError(error -> logger.error("Error generating response with model: {}", model, error));
    }
      /**
     * Check if Ollama is available and the model exists
     */
    public Mono<Boolean> isModelAvailable(String model) {
        return ollamaWebClient
                .get()
                .uri("/api/tags")
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    logger.debug("Available models response: {}", response);
                    return response.contains("\"" + model + "\"") || response.contains(model);
                })
                .doOnError(error -> logger.warn("Could not check model availability for {}: {}", model, error.getMessage()))
                .onErrorReturn(false);
    }
    
    /**
     * Get list of available models
     */
    public Mono<String> getAvailableModels() {
        return ollamaWebClient
                .get()
                .uri("/api/tags")
                .retrieve()
                .bodyToMono(String.class)
                .doOnSuccess(response -> logger.info("Retrieved available models"))
                .doOnError(error -> logger.error("Error getting available models", error))
                .onErrorReturn("{\"models\":[]}");
    }
    
    /**
     * Check if Ollama service is running
     */
    public Mono<Boolean> isOllamaRunning() {
        return ollamaWebClient
                .get()
                .uri("/api/tags")
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> true)
                .doOnError(error -> logger.warn("Ollama service check failed: {}", error.getMessage()))
                .onErrorReturn(false);
    }
    
    /**
     * Pull a model from Ollama registry
     */
    public Mono<String> pullModel(String model) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", model);
        
        return ollamaWebClient
                .post()
                .uri("/api/pull")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .doOnSuccess(response -> logger.info("Model {} pulled successfully", model))
                .doOnError(error -> logger.error("Error pulling model {}", model, error));
    }
    
    private String extractResponse(String jsonResponse) {
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonResponse);
            return jsonNode.get("response").asText();
        } catch (Exception e) {
            logger.error("Error parsing Ollama response", e);
            return "Error parsing response from Ollama";
        }
    }
}
