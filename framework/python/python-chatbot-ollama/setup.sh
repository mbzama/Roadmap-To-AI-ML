#!/bin/bash

# Ollama FastAPI Chatbot Setup Script
echo "🤖 Setting up Ollama FastAPI Chatbot..."

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Please install it first:"
    echo "   curl -fsSL https://ollama.com/install.sh | sh"
    exit 1
fi

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "❌ Ollama is not running. Please start it:"
    echo "   ollama serve"
    exit 1
fi

echo "✅ Ollama is running"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 is available"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment. On Ubuntu/Debian, try:"
        echo "   sudo apt install python3.12-venv"
        exit 1
    fi
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if any models are available
MODELS=$(curl -s http://localhost:11434/api/tags | jq -r '.models | length' 2>/dev/null)
if [ "$MODELS" = "0" ] || [ "$MODELS" = "null" ]; then
    echo "⚠️  No models found. Pulling tinyllama (lightweight model for testing)..."
    ollama pull tinyllama
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the chatbot:"
echo "   ./start.sh"
echo ""
echo "   Or run manually:"
echo "   source venv/bin/activate"
echo "   python main.py          # FastAPI backend"
echo "   streamlit run streamlit_app.py  # Streamlit frontend"
echo ""
echo "📱 Access points:"
echo "   Streamlit UI: http://localhost:8501"
echo "   FastAPI Docs: http://localhost:8000/docs"
