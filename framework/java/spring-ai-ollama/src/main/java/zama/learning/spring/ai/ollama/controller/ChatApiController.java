package zama.learning.spring.ai.ollama.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import zama.learning.spring.ai.ollama.model.ChatMessage;
import zama.learning.spring.ai.ollama.service.ChatService;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ChatApiController {
    
    private final ChatService chatService;
    
    public ChatApiController(ChatService chatService) {
        this.chatService = chatService;
    }
    
    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody ChatMessage chatMessage) {
        if (chatMessage.getMessage() == null || chatMessage.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Message cannot be empty"));
        }
        
        String response = chatService.chat(chatMessage.getMessage());
        return ResponseEntity.ok(Map.of(
            "message", chatMessage.getMessage(),
            "response", response
        ));
    }
}
