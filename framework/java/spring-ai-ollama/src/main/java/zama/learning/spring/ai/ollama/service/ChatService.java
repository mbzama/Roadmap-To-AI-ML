package zama.learning.spring.ai.ollama.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
    
    private final ChatClient chatClient;
    
    public ChatService(OllamaChatModel ollamaChatModel) {
        this.chatClient = ChatClient.builder(ollamaChatModel).build();
    }
    
    public String chat(String message) {
        try {
            return chatClient.prompt()
                .user(message)
                .call()
                .content();
        } catch (Exception e) {
            return "Sorry, I'm having trouble connecting to the AI model. Please make sure Ollama is running and try again.";
        }
    }
}
