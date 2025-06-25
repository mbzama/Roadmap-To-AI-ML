# LangChain Translation Server

A FastAPI web server that provides AI-powered text translation using LangChain and the Groq API.

## Overview

This service creates a REST API endpoint for translating text between languages using the Groq's Gemma2-9B-IT model through LangChain's pipeline architecture.

## Features

- 🌐 **Multi-language Translation**: Translate text to any target language
- ⚡ **Fast API**: High-performance REST API built with FastAPI
- 🔗 **LangChain Integration**: Uses LangChain's modular pipeline approach
- 📊 **Groq API**: Powered by Groq's high-speed inference
- 📖 **Auto Documentation**: Interactive API docs at `/docs`
- 🔒 **Environment Security**: API keys managed via environment variables

## Prerequisites

- Python 3.8+
- Groq API key

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd langchain/5-lang-serve
   ```

2. **Install dependencies**:
   ```bash
   pip install -r ../requirements.txt
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

## Usage

### Starting the Server

```bash
python serve.py
```

The server will start on `http://localhost:8000`

### API Endpoints

#### Translation Endpoint
- **URL**: `POST /chain/invoke`
- **Content-Type**: `application/json`

#### Request Format
```json
{
  "input": {
    "language": "target_language",
    "text": "text_to_translate"
  }
}
```

#### Example Request
```bash
curl -X POST "http://localhost:8000/chain/invoke" \
     -H "Content-Type: application/json" \
     -d '{
       "input": {
         "language": "French",
         "text": "Hello, how are you today?"
       }
     }'
```

#### Example Response
```json
{
  "output": "Bonjour, comment allez-vous aujourd'hui ?"
}
```

### Interactive API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Examples

### Translate to Spanish
```python
import requests

response = requests.post(
    "http://localhost:8000/chain/invoke",
    json={
        "input": {
            "language": "Spanish",
            "text": "Welcome to our application!"
        }
    }
)

print(response.json())
# Output: {"output": "¡Bienvenido a nuestra aplicación!"}
```

### Translate to German
```python
import requests

response = requests.post(
    "http://localhost:8000/chain/invoke",
    json={
        "input": {
            "language": "German",
            "text": "The weather is beautiful today."
        }
    }
)

print(response.json())
# Output: {"output": "Das Wetter ist heute schön."}
```

## Architecture

### LangChain Pipeline
The service uses a LangChain pipeline with three components:

1. **Prompt Template**: Structures the translation request
2. **ChatGroq Model**: Processes the translation using Gemma2-9B-IT
3. **String Output Parser**: Formats the response

```python
chain = prompt_template | model | parser
```

### Components

- **FastAPI**: Web framework for the REST API
- **LangServe**: Automatic endpoint generation for LangChain chains
- **ChatGroq**: Groq API integration for LangChain
- **dotenv**: Environment variable management

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Your Groq API key | Yes |

### Server Configuration

- **Host**: `127.0.0.1` (localhost)
- **Port**: `8000`
- **Model**: `gemma2-9b-it`

## Error Handling

The server includes basic error handling for:
- Missing API key validation
- Model initialization errors
- Invalid request formats

## Development

### Project Structure
```
5-lang-serve/
├── serve.py          # Main server file
├── README.md         # This file
└── .env              # Environment variables (create this)
```

### Running in Development Mode

For development with auto-reload:
```python
import uvicorn
uvicorn.run("serve:app", host="127.0.0.1", port=8000, reload=True)
```

## Troubleshooting

### Common Issues

1. **Missing API Key Error**
   ```
   ValueError: GROQ_API_KEY environment variable is not set.
   ```
   **Solution**: Ensure your `.env` file contains a valid Groq API key.

2. **Port Already in Use**
   ```
   OSError: [Errno 98] Address already in use
   ```
   **Solution**: Kill existing processes on port 8000 or change the port.

3. **Pydantic Compatibility Issues**
   **Solution**: Ensure compatible versions of `pydantic` and `langserve`.

### Testing the Service

Test if the service is running:
```bash
curl http://localhost:8000/health
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the Roadmap-To-AI-ML learning repository.

## Related Documentation

- [LangChain Documentation](https://python.langchain.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Groq API Documentation](https://console.groq.com/docs)
- [LangServe Documentation](https://python.langchain.com/docs/langserve)
