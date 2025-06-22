package com.example.chatbot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot application class for the Ollama Chatbot
 * This application integrates Google ADK with Ollama for local LLM interactions
 */
@SpringBootApplication
public class ChatbotApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(ChatbotApplication.class, args);
        System.out.println("🚀 Spring Boot Ollama Chatbot is running!");
        System.out.println("🌐 Access the application at: http://localhost:8080");
        System.out.println("🤖 Make sure Ollama is running locally on port 11434");
    }
}