package zama.learning.spring.ai.ollama.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import zama.learning.spring.ai.ollama.service.ChatService;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChatController.class)
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ChatService chatService;

    @Test
    void shouldDisplayChatPage() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(view().name("chat"))
                .andExpect(model().attributeExists("chatMessage"))
                .andExpect(model().attributeExists("chatHistory"));
    }

    @Test
    void shouldHandleChatMessage() throws Exception {
        when(chatService.chat(anyString())).thenReturn("Hello! How can I help you?");        mockMvc.perform(post("/chat")
                .param("message", "Hello"))
                .andExpect(status().isOk())
                .andExpect(view().name("chat"));
    }    @Test
    void shouldClearChatHistory() throws Exception {
        mockMvc.perform(post("/clear"))
                .andExpect(status().isOk())
                .andExpect(view().name("chat"));
    }
}
