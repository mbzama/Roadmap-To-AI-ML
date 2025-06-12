# Ollama Chatbot

A modern, responsive chatbot application built with Express.js that connects to Ollama for local LLM interactions.

## Features

- 🤖 **Local LLM Integration**: Connect to Ollama for private, offline AI conversations
- 💬 **Real-time Chat**: Support for both streaming and non-streaming responses
- 🎨 **Modern UI**: Beautiful, responsive interface with dark/light theme support
- 📱 **Mobile Friendly**: Fully responsive design that works on all devices
- 🔄 **Conversation History**: Maintains chat history during sessions
- 🚀 **Real-time Status**: Live connection status with Ollama
- ⚡ **Performance**: Optimized for fast responses and smooth interactions
- 🔧 **Easy Setup**: Pre-configured with TinyLlama for quick testing

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v14 or higher) installed
2. **Ollama** installed and running on your system
3. At least one Ollama model downloaded

### Installing Ollama

#### On Linux/macOS:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### On Windows:
Download from [https://ollama.ai/download](https://ollama.ai/download)

### Download a Model

After installing Ollama, download a model (e.g., TinyLlama):
```bash
ollama pull tinyllama
```

**Why TinyLlama?** It's the default model for this project because:
- 🚀 **Fast**: Quick responses, ideal for testing and development
- 💾 **Lightweight**: Only ~637MB download size
- 🔋 **Efficient**: Works well on systems with limited resources
- ✅ **Reliable**: Stable and well-tested model

Other popular models:
```bash
ollama pull llama2      # Larger, more capable model
ollama pull codellama   # For coding assistance
ollama pull mistral     # Faster, smaller model
ollama pull gemma:2b    # Google's Gemma model
```

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd javascript-chatbot-ollama
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment (optional):**
   Edit `.env` file to customize settings:
   ```env
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=tinyllama
   PORT=3001
   ```

## Usage

1. **Start Ollama (if not already running):**
   ```bash
   ollama serve
   ```

2. **Start the chatbot application:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3001`

## API Endpoints

### Chat Endpoints

- `POST /api/chat/message` - Send a message (non-streaming)
- `POST /api/chat/stream` - Send a message (streaming)
- `GET /api/chat/history/:conversationId` - Get conversation history
- `DELETE /api/chat/history/:conversationId` - Clear conversation history

### System Endpoints

- `GET /health` - Check system health and Ollama connection
- `GET /api/chat/models` - Get available Ollama models

### Example API Usage

#### Send a Message
```javascript
const response = await fetch('/api/chat/message', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        message: 'Hello, how are you?',
        conversationId: 'optional-conversation-id'
    })
});

const data = await response.json();
console.log(data.response);
```

#### Streaming Response
```javascript
const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        message: 'Tell me a story',
        conversationId: 'optional-conversation-id'
    })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    // Process streaming data
}
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `tinyllama` | Default model to use |
| `PORT` | `3001` | Server port |

### Changing Models

You can change the model by:

1. **Environment variable:**
   ```env
   OLLAMA_MODEL=mistral
   ```

2. **Programmatically** (modify `services/ollamaService.js`):
   ```javascript
   this.model = 'your-preferred-model';
   ```

## Project Structure

```
javascript-chatbot-ollama/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── package-lock.json      # Dependency lock file
├── .env                   # Environment configuration
├── .gitignore            # Git ignore rules
├── README.md             # Project documentation
├── services/
│   └── ollamaService.js   # Ollama integration service
├── routes/
│   └── chat.js           # Chat API routes
└── public/
    ├── index.html        # Main HTML file
    ├── styles.css        # Styling
    └── script.js         # Frontend JavaScript
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

3. **Slow responses**
   - Try a smaller model like `mistral`
   - Ensure sufficient RAM (8GB+ recommended)
   - Close other resource-intensive applications

4. **Connection timeout**
   - Increase timeout in `services/ollamaService.js`
   - Check system resources
   - Try restarting Ollama

### Health Check

Visit `http://localhost:3001/health` to check:
- Server status
- Ollama connection
- Current timestamp

### Logs

The application logs important events to the console. Check the terminal where you started the server for:
- Connection status
- Error messages
- Request logs

## Customization

### UI Themes

The application supports both light and dark themes automatically based on user preferences. You can customize colors in `public/styles.css`.

### Adding New Features

1. **Custom system prompts**: Modify the system message in `services/ollamaService.js`
2. **New endpoints**: Add routes in `routes/chat.js`
3. **UI enhancements**: Modify `public/index.html`, `public/styles.css`, and `public/script.js`

## Performance Tips

1. **Use appropriate models**: Smaller models = faster responses
2. **Limit conversation history**: Currently limited to 20 messages
3. **Enable streaming**: Better user experience for long responses
4. **Optimize hardware**: More RAM and CPU cores help

## Security Considerations

- This application is designed for local use
- No authentication is implemented by default
- Conversation history is stored in memory (cleared on restart)
- For production use, consider adding authentication and persistent storage

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
- **This application**: Create an issue in the repository
- **Node.js/Express**: Check respective documentation

---

**Happy chatting with your local AI!** 🤖
