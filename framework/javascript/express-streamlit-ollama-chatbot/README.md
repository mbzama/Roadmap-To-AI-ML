# Express.js + Streamlit Ollama Chatbot

This project combines Express.js backend with Streamlit frontend to create a chatbot that connects to Ollama (local LLM).

## Architecture

- **Backend**: Express.js API server that handles Ollama communication
- **Frontend**: Streamlit web application for the chatbot UI
- **LLM**: Ollama for local language model inference

## Features

- 🤖 **Local LLM Integration**: Connect to Ollama for private, offline AI conversations
- 🎨 **Modern Streamlit UI**: Beautiful, interactive chat interface built with Streamlit
- ⚡ **Express.js API**: Fast and efficient backend API for Ollama communication
- 🔄 **Real-time Chat**: Live conversation with the AI model
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🛡️ **Security**: CORS protection and request validation
- 🔧 **Easy Setup**: Simple installation and configuration

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v14 or higher) installed
2. **Python** (v3.8 or higher) installed
3. **Ollama** installed and running on your system
4. At least one Ollama model downloaded

### Installing Ollama

#### On Windows:
Download from [https://ollama.ai/download](https://ollama.ai/download)

#### On Linux/macOS:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Download a Model

After installing Ollama, download a model (e.g., Llama2):
```bash
ollama pull llama2
```

Other popular models:
```bash
ollama pull mistral      # Fast, efficient model
ollama pull codellama    # For coding assistance  
ollama pull tinyllama    # Lightweight model
```

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd express-streamlit-ollama-chatbot
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Install Python dependencies:**
   ```bash
   pip install streamlit requests python-dotenv
   ```
   
   Or use npm script:
   ```bash
   npm run install-streamlit
   ```

4. **Configure environment (optional):**
   Create `.env` file to customize settings:
   ```env
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama2
   PORT=3001
   ```

## Usage

### Option 1: Start Both Services Together (Recommended)
```bash
npm run start-all
```
This will start both the Express.js backend and Streamlit frontend concurrently.

### Option 2: Start Services Separately

1. **Start Ollama (if not already running):**
   ```bash
   ollama serve
   ```

2. **Start the Express.js backend:**
   ```bash
   npm run start-backend
   ```

3. **Start the Streamlit frontend (in a new terminal):**
   ```bash
   npm run start-frontend
   ```

4. **Open your browser:**
   - Streamlit UI: `http://localhost:8501`
   - Express.js API: `http://localhost:3001`

## API Endpoints

The Express.js backend provides the following endpoints:

### Chat Endpoints
- `POST /api/chat/message` - Send a message to the chatbot
- `POST /api/chat/stream` - Send a message with streaming response
- `GET /api/chat/models` - Get available Ollama models

### System Endpoints
- `GET /health` - Check system health and Ollama connection

### Example API Usage

```bash
# Send a chat message
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'

# Check health
curl http://localhost:3001/health
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama2` | Default model to use |
| `PORT` | `3001` | Express.js server port |

### Changing Models

You can change the model by:

1. **Environment variable:**
   ```env
   OLLAMA_MODEL=mistral
   ```

2. **In Streamlit UI:** Use the model selector in the sidebar

## Project Structure

```
express-streamlit-ollama-chatbot/
├── server.js              # Express.js server
├── package.json           # Node.js dependencies
├── streamlit_app.py       # Streamlit frontend
├── requirements.txt       # Python dependencies
├── .env                   # Environment configuration
├── services/
│   └── ollamaService.js   # Ollama integration service
├── routes/
│   └── chat.js           # Chat API routes
└── README.md             # This file
```

## Troubleshooting

### Common Issues

1. **"Cannot connect to Ollama"**
   - Make sure Ollama is running: `ollama serve`
   - Check if the URL is correct in `.env`
   - Verify firewall settings

2. **"Model not found"**
   - Download the model: `ollama pull model-name`
   - Check available models: `ollama list`
   - Update `OLLAMA_MODEL` in `.env`

3. **Port conflicts**
   - Change the Express.js port in `.env` file
   - Make sure ports 3001 and 8501 are available

4. **Streamlit connection issues**
   - Ensure the Express.js backend is running on port 3001
   - Check CORS settings if accessing from different domains

## License

MIT License - feel free to use and modify as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues related to:
- **Ollama**: Check [Ollama documentation](https://ollama.ai/docs)
- **Express.js**: Check [Express.js documentation](https://expressjs.com/)
- **Streamlit**: Check [Streamlit documentation](https://docs.streamlit.io/)

---

**Happy chatting with your local AI!** 🤖
