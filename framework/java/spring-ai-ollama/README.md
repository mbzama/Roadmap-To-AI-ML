# Spring AI Ollama Chatbot

A modern chatbot application built with Spring Boot, Spring AI, and Ollama for local LLM inference. Features a beautiful web interface using Thymeleaf and Bootstrap.

## 🚀 Features

- **Local LLM Integration**: Connect to Ollama for private, local AI inference
- **Modern Web UI**: Beautiful, responsive chat interface with Thymeleaf and Bootstrap
- **Real-time Chat**: Interactive conversation with typing indicators
- **Session Management**: Persistent chat history during browser session
- **REST API**: RESTful endpoints for programmatic access
- **Error Handling**: Graceful error handling and user feedback
- **Health Monitoring**: Built-in health checks and monitoring endpoints

## 📋 Prerequisites

Before running the application, ensure you have:

- **Java 21** or higher
- **Maven 3.6+** 
- **Ollama** installed and running locally
- **Hardware Requirements for TinyLlama**:
  - **Minimum**: 2GB RAM, 2GB free disk space
  - **Recommended**: 4GB RAM, 4GB free disk space
  - **CPU**: Any modern processor (Intel/AMD x64 or Apple Silicon)
  - **GPU**: Optional (CUDA/ROCm for faster inference)

## 🛠️ Installation & Setup

### 1. Install Ollama

**Windows:**
```powershell
# Download and install from https://ollama.ai
# Or use winget
winget install Ollama.Ollama
```

**macOS:**
```bash
# Using Homebrew
brew install ollama
```

**Linux:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Start Ollama Service

```bash
# Start Ollama server
ollama serve

# In another terminal, pull the required model
ollama pull tinyllama
```

### 3. Clone and Setup Project

```powershell
# Navigate to the project directory
cd "Roadmap-To-AI-ML\framework\java\spring-ai-ollama"

# Verify Maven installation
mvn --version
```

## 🚀 Running the Application

### Option 1: Using Maven

```powershell
# Build and run with Maven
mvn clean spring-boot:run
```

### Option 2: Build JAR and Run

```powershell
# Build the application
mvn clean package

# Run the JAR file
java -jar target/spring-ai-ollama-1.0.0.jar
```

### Option 3: Using the Run Script (Unix/Linux/Mac)

```bash
# Make script executable and run
chmod +x run.sh
./run.sh
```

## 🌐 Accessing the Application

Once the application starts successfully:

- **Web Interface**: http://localhost:8080
- **Health Check**: http://localhost:8080/actuator/health
- **API Documentation**: See API section below

## 🔧 Configuration

### Application Properties

Key configuration options in `src/main/resources/application.properties`:

```properties
# Ollama Configuration
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.chat.model=tinyllama

# Server Configuration
server.port=8080

# Logging Configuration
logging.level.zama.learning.spring.ai.ollama=DEBUG
```

### Available Ollama Models

You can change the model in `application.properties`. Popular options:

```bash
# Pull different models (ordered by resource requirements - lightest to heaviest)
ollama pull tinyllama        # Default - Ultra-lightweight 1.1B params (~1GB RAM)
ollama pull phi3:mini        # Microsoft's efficient 3.8B params (~2.5GB RAM)
ollama pull gemma2:2b        # Google's 2B parameter model (~2GB RAM)
ollama pull llama3.2:3b      # Meta's 3B parameter model (~3GB RAM)
ollama pull gemma2:9b        # Google's 9B parameter model (~6GB RAM)
ollama pull llama3.1:8b      # Meta's 8B parameter model (~6GB RAM)
ollama pull codellama        # Code-focused model (~7GB RAM)
ollama pull mistral          # Mistral 7B model (~5GB RAM)
```

**Model Recommendations by Hardware:**
- **2-4GB RAM**: `tinyllama`, `phi3:mini`
- **4-6GB RAM**: `gemma2:2b`, `llama3.2:3b`
- **6-8GB RAM**: `gemma2:9b`, `llama3.1:8b`, `mistral`
- **8GB+ RAM**: Any model including larger variants

## 📡 API Endpoints

### Web Interface

- `GET /` - Main chat interface
- `POST /chat` - Submit chat message (form submission)
- `POST /clear` - Clear chat history

### REST API

- `POST /api/chat` - Chat API endpoint

**Example API Usage:**

```bash
# Send a chat message via API
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'

# Expected response
{
  "message": "Hello, how are you?",
  "response": "Hello! I'm doing well, thank you for asking. How can I help you today?"
}
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
mvn test

# Run tests with coverage
mvn test jacoco:report

# Run specific test class
mvn test -Dtest=ChatControllerTest
```

### Manual Testing

1. **Start Ollama**: Ensure Ollama is running with a model loaded
2. **Start Application**: Run the Spring Boot application
3. **Test Web Interface**: Navigate to http://localhost:8080
4. **Test API**: Use curl or Postman to test API endpoints

## 📁 Project Structure

```
spring-ai-ollama/
├── src/
│   ├── main/
│   │   ├── java/zama/learning/spring/ai/ollama/
│   │   │   ├── SpringAiOllamaApplication.java     # Main application class
│   │   │   ├── controller/
│   │   │   │   ├── ChatController.java            # Web MVC controller
│   │   │   │   └── ChatApiController.java         # REST API controller
│   │   │   ├── model/
│   │   │   │   └── ChatMessage.java               # Chat message model
│   │   │   └── service/
│   │   │       └── ChatService.java               # Business logic
│   │   └── resources/
│   │       ├── application.properties              # Configuration
│   │       └── templates/
│   │           └── chat.html                      # Thymeleaf template
│   └── test/
│       └── java/zama/learning/spring/ai/ollama/
│           ├── SpringAiOllamaApplicationTests.java
│           └── controller/
│               └── ChatControllerTest.java
├── pom.xml                                        # Maven dependencies
├── .gitignore                                     # Git ignore rules
└── README.md                                      # This file
```

## 🎨 User Interface Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Chat**: Instant message display with smooth scrolling
- **Typing Indicators**: Visual feedback during AI response generation
- **Message History**: Persistent chat history during session
- **Clean UI**: Modern Bootstrap-based design
- **Error Handling**: User-friendly error messages

## 🔍 Troubleshooting

### Common Issues

**1. Ollama Connection Error**
```
Error: Connection refused to localhost:11434
```
**Solution**: 
- Ensure Ollama is running: `ollama serve`
- Check if port 11434 is available
- Verify Ollama installation

**2. Model Not Found**
```
Error: Model tinyllama not found
```
**Solution**:
- Pull the model: `ollama pull tinyllama`
- Check available models: `ollama list`
- Update model name in `application.properties`

**3. Out of Memory**
```
Error: Failed to load model
```
**Solution**:
- Use a smaller model (e.g., `tinyllama` - only ~1GB RAM required)
- Increase available system memory
- Close other memory-intensive applications
- Consider using `phi3:mini` for better performance with low memory

**4. Port Already in Use**
```
Error: Port 8080 is already in use
```
**Solution**:
- Change port in `application.properties`: `server.port=8081`
- Kill process using port 8080: `netstat -ano | findstr :8080`

### Logs and Debugging

```bash
# Check application logs
tail -f spring-ai-ollama.log

# Enable debug logging
# Add to application.properties:
logging.level.org.springframework.ai=DEBUG
logging.level.zama.learning.spring.ai.ollama=DEBUG
```

## 🔄 Development

### Development Mode

```bash
# Run with auto-reload (requires spring-boot-devtools)
mvn spring-boot:run

# Or with profile
mvn spring-boot:run -Dspring.profiles.active=dev
```

### Code Style

- Follow standard Java conventions
- Use meaningful variable and method names
- Add JavaDoc for public methods
- Write tests for new features

## 🚀 Deployment

### Production Deployment

1. **Build Production JAR**:
```bash
mvn clean package -Pprod
```

2. **Configure Production Properties**:
```properties
# application-prod.properties
spring.ai.ollama.base-url=http://ollama-server:11434
server.port=80
logging.level.root=WARN
```

3. **Run in Production**:
```bash
java -jar -Dspring.profiles.active=prod target/spring-ai-ollama-1.0.0.jar
```

### Docker Deployment (Future Enhancement)

```dockerfile
# Dockerfile example for future use
FROM openjdk:21-jre-slim
COPY target/spring-ai-ollama-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is part of the Roadmap-To-AI-ML learning repository.

## 🔗 Resources

- [Spring AI Documentation](https://docs.spring.io/spring-ai/reference/)
- [Ollama Models](https://ollama.ai/library)
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
- [Thymeleaf Documentation](https://www.thymeleaf.org/documentation.html)

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review application logs
3. Verify Ollama is running correctly
4. Check the [Spring AI documentation](https://docs.spring.io/spring-ai/reference/)

---

**Happy Chatting! 🤖💬**
