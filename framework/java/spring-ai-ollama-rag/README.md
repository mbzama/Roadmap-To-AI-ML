# Spring AI Ollama RAG Application

## Overview

This project demonstrates how to build a **Retrieval-Augmented Generation (RAG)** application using Spring AI framework with Ollama for local LLM inference and a vector database for semantic search capabilities.

## What is Spring AI?

**Spring AI** is a comprehensive framework that brings artificial intelligence capabilities to Spring applications. It provides:

- **Unified API** for working with different AI models and providers
- **Prompt Engineering** support with templates and structured prompts  
- **Document Processing** for ingesting and embedding text documents
- **Vector Store Integration** for semantic search and retrieval
- **Chat Memory** for maintaining conversation context
- **Integration** with popular AI services like OpenAI, Azure OpenAI, Hugging Face, and local models

Spring AI abstracts the complexity of working with AI models, making it easier to integrate intelligent features into enterprise Java applications.

## What is a Vector Database?

A **Vector Database** is a specialized database designed to store, index, and query high-dimensional vectors efficiently. In the context of RAG applications:

- **Document Embedding**: Text documents are converted into numerical vectors using embedding models
- **Semantic Search**: Instead of keyword matching, vector databases enable similarity-based search
- **Retrieval**: Relevant documents are found by comparing query vectors with stored document vectors
- **Scalability**: Vector databases can handle millions of vectors with fast retrieval times

This enables more intelligent and context-aware document retrieval compared to traditional text search.

## Project Structure

```
├── src/main/java/zama/learning/springai/rag/
│   ├── SpringAiRagTutorialApplication.java    # Main application class
│   ├── ChatController.java                    # REST API endpoints
│   └── ingestion/
│       └── DocumentIngestionService.java      # Document processing service
├── src/main/resources/
│   ├── application.properties                 # Configuration
│   └── pdf/
│       └── spring-boot-reference.pdf         # Sample document for RAG
├── docker-compose.yml                         # Infrastructure services
├── pom.xml                                    # Maven dependencies
└── run.sh                                     # Application runner script
```

## Prerequisites

Before running the application, ensure you have:

- **Java 17** or higher
- **Maven 3.6+**
- **Docker** and **Docker Compose**
- At least **4GB RAM** available for Ollama models

## How to Run the Application

### 1. Clone the Repository

```bash
git clone https://github.com/mbzama/Roadmap-To-AI-ML.git
cd Roadmap-To-AI-ML/framework/java/spring-ai-ollama-rag
```

### 2. Start Infrastructure Services

Start the required services (Ollama, vector database) using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- **Ollama** server for local LLM inference
- **Vector Database** (e.g., Chroma, Weaviate, or PostgreSQL with pgvector)

### 3. Build the Application

```bash
./mvnw clean package
```

### 4. Run the Application

You can run the application in several ways:

**Option A: Using the provided script**
```bash
./run.sh
```

**Option B: Using Maven**
```bash
./mvnw spring-boot:run
```

**Option C: Using Java directly**
```bash
java -jar target/spring-ai-ollama-rag-1.0.0.jar
```

### 5. Verify the Application

Once started, the application will be available at `http://localhost:8080`

**Check if the application is running:**
```bash
curl http://localhost:8080/actuator/health
```

## API Endpoints

### Chat Endpoint
```bash
# Send a question to the RAG system
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Spring Boot?"}'
```

### Document Ingestion
```bash
# Ingest documents into the vector database
curl -X POST http://localhost:8080/ingest \
  -H "Content-Type: application/json"
```

## Configuration

Key configuration properties in `application.properties`:

```properties
# Ollama configuration
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.chat.model=llama2

# Vector store configuration
spring.ai.vectorstore.chroma.url=http://localhost:8000

# Application settings
spring.ai.rag.chunk-size=1000
spring.ai.rag.chunk-overlap=200
```

## How It Works

1. **Document Ingestion**: PDF documents are processed, split into chunks, and embedded into vectors
2. **Vector Storage**: Document embeddings are stored in the vector database with metadata
3. **Query Processing**: User queries are embedded using the same model
4. **Similarity Search**: Vector database finds the most relevant document chunks
5. **Context Augmentation**: Retrieved documents are used as context for the LLM
6. **Response Generation**: Ollama generates responses based on the retrieved context

## Troubleshooting

### Common Issues

**Ollama not responding:**
```bash
# Check if Ollama is running
docker ps | grep ollama

# Pull required model if not available
docker exec -it ollama_container ollama pull llama2
```

**Vector database connection issues:**
```bash
# Check vector database logs
docker-compose logs vectordb
```

**Out of memory errors:**
```bash
# Increase Docker memory limits or use smaller models
export DOCKER_DEFAULT_PLATFORM=linux/amd64
```

## Next Steps

- Experiment with different embedding models
- Try various LLM models available in Ollama
- Implement custom document processors
- Add authentication and security
- Scale with production-ready vector databases

## Resources

- [Spring AI Documentation](https://docs.spring.io/spring-ai/reference/)
- [Ollama Models](https://ollama.ai/library)
- [Vector Database Comparison](https://github.com/spring-projects/spring-ai#vector-stores)