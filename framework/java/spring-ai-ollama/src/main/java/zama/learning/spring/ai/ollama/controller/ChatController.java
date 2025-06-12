package zama.learning.spring.ai.ollama.controller;

import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import zama.learning.spring.ai.ollama.model.ChatMessage;
import zama.learning.spring.ai.ollama.service.ChatService;

import java.util.ArrayList;
import java.util.List;

@Controller
@SessionAttributes("chatHistory")
public class ChatController {
    
    private final ChatService chatService;
    
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }
    
    @ModelAttribute("chatHistory")
    public List<ChatMessage> chatHistory() {
        return new ArrayList<>();
    }
    
    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("chatMessage", new ChatMessage());
        return "chat";
    }
    
    @PostMapping("/chat")
    public String chat(@Valid @ModelAttribute ChatMessage chatMessage, 
                      BindingResult bindingResult,
                      @ModelAttribute("chatHistory") List<ChatMessage> chatHistory,
                      Model model) {
        
        if (bindingResult.hasErrors()) {
            return "chat";
        }
        
        // Get response from AI
        String response = chatService.chat(chatMessage.getMessage());
        
        // Create a complete chat message with both user input and AI response
        ChatMessage completeChatMessage = new ChatMessage(chatMessage.getMessage(), response);
        
        // Add to chat history
        chatHistory.add(completeChatMessage);
        
        // Clear the form for next message
        model.addAttribute("chatMessage", new ChatMessage());
        
        return "chat";
    }
    
    @PostMapping("/clear")
    public String clearChat(@ModelAttribute("chatHistory") List<ChatMessage> chatHistory, Model model) {
        chatHistory.clear();
        model.addAttribute("chatMessage", new ChatMessage());
        return "chat";
    }
}
