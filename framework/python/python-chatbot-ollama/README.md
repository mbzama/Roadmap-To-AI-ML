# Ollama FastAPI Chatbot

A modern chatbot application built with FastAPI backend and Streamlit frontend that connects to Ollama for local LLM inference.

## 🚀 Quick Start

### Option A: Automated Setup (Recommended)
```bash
# Navigate to project directory
cd python-chatbot-ollama

# Make sure Ollama is running first
ollama serve  # In one terminal

# Run the automated setup script (in another terminal)
./setup.sh

# Start the applications
./start.sh
```

### Option B: Manual Setup

### 1. Start Ollama Service
```bash
# Make sure Ollama is running
ollama serve

# In another terminal, pull a model if you haven't already
ollama pull tinyllama  # or llama2, mistral, etc.
```

### 2. Set Up Python Environment
```bash
# Navigate to project directory
cd python-chatbot-ollama

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Start the Applications

**Option A: Run Both Services Automatically**
```bash
chmod +x start.sh
./start.sh
```

**Option B: Run Services Manually**
```bash
# Terminal 1: Start FastAPI backend
source venv/bin/activate
python main.py

# Terminal 2: Start Streamlit frontend (in new terminal)
source venv/bin/activate
streamlit run streamlit_app.py
```

### 4. Access the Applications
- **Streamlit Web UI**: http://localhost:8501
- **FastAPI Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000/health

## 💬 Usage Example

Once both services are running:

1. **Open the Streamlit UI** at http://localhost:8501
2. **Check the sidebar** - you should see "✅ API Connected" 
3. **Select a model** from the dropdown (e.g., tinyllama, llama2)
4. **Start chatting** by typing a message in the input box
5. **View the conversation** history in the main chat area

**Sample API Usage** (if using the API directly):
```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "tell me a story",
    "model": "tinyllama:latest",
    "conversation_history": []
  }'
```

## Features

- **FastAPI Backend**: RESTful API with automatic documentation
- **Streamlit Frontend**: Beautiful and interactive web UI
- **Ollama Integration**: Connect to local LLM models
- **Real-time Chat**: Conversation history and streaming support
- **Model Selection**: Choose from available Ollama models
- **Health Monitoring**: API health checks and connection status
- **CORS Support**: Cross-origin requests enabled

## API Endpoints

- `GET /` - Root endpoint
- `GET /models` - Get available Ollama models
- `POST /chat` - Send chat message
- `POST /chat/stream` - Stream chat response
- `GET /health` - Health check

### API Documentation
Visit http://localhost:8000/docs for interactive API documentation.

## Configuration

### Environment Variables
You can customize the following (optional):
- `OLLAMA_HOST`: Ollama server URL (default: http://localhost:11434)
- `FASTAPI_HOST`: FastAPI host (default: 0.0.0.0)
- `FASTAPI_PORT`: FastAPI port (default: 8000)

### Streamlit Configuration
The Streamlit app connects to the FastAPI backend at `http://localhost:8000` by default.

## Project Structure

```
python-chatbot-ollama/
├── main.py              # FastAPI backend application
├── streamlit_app.py     # Streamlit frontend application
├── requirements.txt     # Python dependencies
├── config.py           # Configuration settings
├── setup.sh            # Automated setup script
├── start.sh            # Script to start both services
├── test_connection.py  # Connection testing utility
├── .gitignore          # Git ignore file
└── README.md           # This documentation
```

## Features in Detail

### FastAPI Backend
- **RESTful API**: Clean and well-documented API endpoints
- **Pydantic Models**: Type validation for requests and responses
- **Error Handling**: Comprehensive error handling and logging
- **CORS Middleware**: Enable cross-origin requests
- **Health Checks**: Monitor Ollama connection status

### Streamlit Frontend
- **Modern UI**: Clean and responsive chat interface
- **Model Selection**: Dropdown to choose from available models
- **Conversation History**: Persistent chat history during session
- **Real-time Status**: Live API connection status
- **Clear Conversation**: Reset chat history
- **Statistics**: Display conversation metrics

## 🧪 Testing the Setup

Run the connection test to verify everything is working:
```bash
source venv/bin/activate
python test_connection.py
```

You can also test individual components:
```bash
# Test Ollama directly
curl http://localhost:11434/api/tags

# Test FastAPI health
curl http://localhost:8000/health

# Test API models endpoint
curl http://localhost:8000/models
```

## 🛠️ Troubleshooting

### Common Issues and Solutions

**1. Ollama not running**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve

# Check available models
ollama list
```

**2. API connection failed**
```bash
# Check if FastAPI is running
curl http://localhost:8000/health

# If not running, start it
python main.py
```

**3. No models available**
```bash
# Pull a lightweight model for testing
ollama pull tinyllama

# Or pull other models
ollama pull llama2
ollama pull mistral
```

**4. Virtual environment issues**
```bash
# On Ubuntu/Debian, install venv if missing
sudo apt install python3.12-venv

# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**5. Port conflicts**
- FastAPI uses port 8000
- Streamlit uses port 8501  
- Ollama uses port 11434

Check what's using ports:
```bash
lsof -i :8000
lsof -i :8501
lsof -i :11434
```

## Development

To extend the application:

1. **Add new API endpoints** in `main.py`
2. **Enhance the UI** in `streamlit_app.py`
3. **Add new features** like:
   - User authentication
   - Chat history persistence
   - Multiple conversation threads
   - File uploads
   - Custom model parameters

## 📚 Helpful Resources

- **Ollama Documentation**: https://ollama.com/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Streamlit Documentation**: https://docs.streamlit.io/
- **Available Models**: Run `ollama list` or visit https://ollama.com/library

### Recommended Models for Testing
```bash
# Lightweight models (good for testing)
ollama pull tinyllama      # ~637MB
ollama pull gemma3:1b      # ~815MB

# Medium models (better quality)
ollama pull llama2         # ~3.8GB
ollama pull mistral        # ~4.1GB

# Larger models (best quality, requires more RAM)
ollama pull llama3         # ~4.7GB
ollama pull deepseek-r1    # ~5.2GB
```

## License

This project is open source and available under the MIT License.
