# 🤖 LangGraph Agentic AI Chatbot

A sophisticated conversational AI application built with LangGraph that provides stateful agentic capabilities. This project implements an intelligent chatbot with multiple use cases, including basic conversation and web search-enhanced responses.

## ✨ Features

- **Basic Chatbot**: Simple conversational AI powered by state-of-the-art language models
- **Web Search Integration**: Enhanced chatbot with real-time web search capabilities using Tavily
- **Multiple LLM Support**: Currently supports Groq models (llama3-8b-8192, llama3-70b-8192, gemma2-9b-it)
- **Streamlit UI**: User-friendly web interface for seamless interaction
- **Stateful Conversations**: Maintains conversation context using LangGraph's state management
- **Modular Architecture**: Clean, extensible codebase with separation of concerns

## 🛠️ Technology Stack

- **LangGraph**: For building stateful multi-agent workflows
- **LangChain**: Core framework for LLM applications
- **Streamlit**: Web interface framework
- **Groq**: High-performance LLM inference
- **Tavily**: Web search API for real-time information retrieval
- **FAISS**: Vector database for similarity search

## 📋 Prerequisites

- Python 3.8 or higher
- Groq API key ([Get one here](https://console.groq.com/))
- Tavily API key ([Get one here](https://tavily.com/)) - Required for web search functionality

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd agentic-chatbot
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables
You'll need to obtain API keys:
- **Groq API Key**: Sign up at [Groq Console](https://console.groq.com/)
- **Tavily API Key**: Sign up at [Tavily](https://tavily.com/) (only needed for web search functionality)

### 4. Run the Application
```bash
streamlit run app.py
```

The application will open in your default web browser at `http://localhost:8501`.

## 💡 Usage

1. **Launch the App**: Run `streamlit run app.py` in your terminal
2. **Configure Settings**: In the sidebar, select:
   - Your preferred LLM model
   - Enter your Groq API key
   - Choose use case (Basic Chatbot or Chatbot with Web Search)
3. **Start Chatting**: Type your message in the chat input and interact with the AI

### Use Cases

#### Basic Chatbot
- Simple conversational AI
- Maintains conversation context
- Powered by your selected Groq model

#### Chatbot with Web Search
- All basic chatbot features
- Real-time web search capabilities
- Provides up-to-date information from the internet
- Cites sources for web-based responses

## 🏗️ Project Structure

```
agentic-chatbot/
├── app.py                          # Main application entry point
├── requirements.txt                # Python dependencies
├── README.md                       # Project documentation
└── src/
    └── langgraphagenticai/
        ├── main.py                 # Core application logic
        ├── graph/
        │   └── graph_builder.py    # LangGraph workflow definitions
        ├── LLMS/
        │   └── groqllm.py         # Groq LLM configuration
        ├── nodes/
        │   ├── basic_chatbot_node.py      # Basic chatbot node
        │   └── chatbot_tool_node.py       # Tool-enhanced chatbot node
        ├── state/
        │   └── state.py           # Application state management
        ├── tools/
        │   └── search_tool.py     # Web search tool integration
        └── ui/
            ├── uiconfigfile.py    # UI configuration
            ├── uiconfigfile.ini   # UI settings
            └── streamlitui/
                ├── loadui.py      # UI loading logic
                └── display_result.py  # Result display logic
```

## 🔧 Configuration

The application can be configured through the `src/langgraphagenticai/ui/uiconfigfile.ini` file:

- **PAGE_TITLE**: Application title
- **LLM_OPTIONS**: Available LLM providers
- **USECASE_OPTIONS**: Available use cases
- **GROQ_MODEL_OPTIONS**: Available Groq models

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure your Groq API key is valid and has sufficient credits
2. **Import Errors**: Make sure all dependencies are installed with `pip install -r requirements.txt`
3. **Web Search Not Working**: Verify your Tavily API key is set up correctly in your environment

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page for common problems
- Create a new issue if you encounter a bug
- Refer to the [LangGraph documentation](https://langchain-ai.github.io/langgraph/) for advanced usage

## 🙏 Acknowledgments

- [LangChain](https://langchain.com/) for the amazing LLM framework
- [Streamlit](https://streamlit.io/) for the intuitive web interface
- [Groq](https://groq.com/) for high-performance LLM inference
- [Tavily](https://tavily.com/) for web search capabilities
