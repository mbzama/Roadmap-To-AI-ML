# Spring Boot Ollama Chatbot with Google ADK

A modern, responsive chatbot application built with Spring Boot 3.5.0, integrating Google's Agent Development Kit (ADK) with Ollama for local LLM interactions.

## 🚀 Features

- **Modern UI**: Beautiful, responsive web interface built with Bootstrap 5
- **Local LLM Integration**: Connect to Ollama for private, local AI interactions
- **Google ADK**: Leverages Google's Agent Development Kit for advanced agent capabilities
- **Real-time Chat**: Smooth, real-time chat experience with typing indicators
- **Session Management**: Chat history management and session handling
- **REST API**: Complete REST API for programmatic access
- **Reactive Programming**: Built with Spring WebFlux for non-blocking operations

## 🛠 Tech Stack

- **Backend**: Spring Boot 3.5.0, Java 21
- **Frontend**: Thymeleaf, Bootstrap 5, JavaScript
- **Build Tool**: Maven
- **LLM Integration**: Ollama API
- **Agent Framework**: Google ADK (Agent Development Kit)
- **HTTP Client**: Spring WebFlux WebClient

## 📋 Prerequisites

1. **Java 21+** installed
2. **Maven** installed
3. **Ollama** running locally on port 11434
4. A language model installed in Ollama (e.g., `llama2`)

### Installing Ollama and Models

1. Install Ollama from [https://ollama.ai](https://ollama.ai)
2. Start Ollama service: `ollama serve`
3. Pull a model: `ollama pull tinyllama`

## 🚦 Getting Started

### 1. Build and Run

```bash
mvn clean compile
mvn spring-boot:run
```

### 2. Access the Application

- **Web Interface**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

## 🌐 REST API Endpoints

### Chat API
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Hello, how are you?",
  "model": "tinyllama "
}
```
        </dependency>
        <dependency>
            <groupId>com.google.adk</groupId>
            <artifactId>google-adk</artifactId>
            <version>0.1.0</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### 2. `ChatbotApplication.java`

```java
package com.example.chatbot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ChatbotApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChatbotApplication.class, args);
    }
}
```

### 3. `ChatMessage.java`

```java
package com.example.chatbot.model;

public class ChatMessage {
    private String userMessage;
    private String botResponse;

    // Getters and Setters
    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }

    public String getBotResponse() {
        return botResponse;
    }

    public void setBotResponse(String botResponse) {
        this.botResponse = botResponse;
    }
}
```

### 4. `ChatbotService.java`

```java
package com.example.chatbot.service;

import com.google.adk.Adk;
import com.google.adk.AdkResponse;
import org.springframework.stereotype.Service;

@Service
public class ChatbotService {
    private final Adk adk;

    public ChatbotService() {
        this.adk = new Adk(); // Initialize the Adk client
    }

    public String getResponse(String userMessage) {
        AdkResponse response = adk.query(userMessage);
        return response.getResponse(); // Assuming getResponse() returns the bot's response
    }
}
```

### 5. `ChatbotController.java`

```java
package com.example.chatbot.controller;

import com.example.chatbot.model.ChatMessage;
import com.example.chatbot.service.ChatbotService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ModelAttribute;

@Controller
@RequestMapping("/")
public class ChatbotController {
    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @RequestMapping
    public String index(Model model) {
        model.addAttribute("chatMessage", new ChatMessage());
        return "index";
    }

    @PostMapping("/chat")
    public String chat(@ModelAttribute ChatMessage chatMessage, Model model) {
        String response = chatbotService.getResponse(chatMessage.getUserMessage());
        chatMessage.setBotResponse(response);
        model.addAttribute("chatMessage", chatMessage);
        return "index";
    }
}
```

### 6. `index.html`

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Chatbot</title>
</head>
<body>
    <h1>Chatbot</h1>
    <form action="#" th:action="@{/chat}" th:object="${chatMessage}" method="post">
        <label for="userMessage">You:</label>
        <input type="text" id="userMessage" th:field="*{userMessage}" required />
        <button type="submit">Send</button>
    </form>
    <div>
        <h2>Bot:</h2>
        <p th:text="${chatMessage.botResponse}"></p>
    </div>
</body>
</html>
```

### 7. `application.properties`

```properties
spring.thymeleaf.cache=false
```

### Running the Application

1. Make sure you have Java 21 and Maven installed.
2. Navigate to the project directory and run the following command to build and run the application:

```bash
mvn spring-boot:run
```

3. Open your browser and go to `http://localhost:8080` to interact with the chatbot.

### Note

- Ensure that the Ollama LLM is running locally and accessible by the Adk client.
- You may need to adjust the `getResponse` method in `ChatbotService` based on how the Adk library interacts with the LLM.
- This is a basic implementation. You can enhance it by adding error handling, user session management, and more features as needed.