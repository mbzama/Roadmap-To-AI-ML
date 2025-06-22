# LangChain + Azure OpenAI Chat Applications

This project contains several chat applications built with LangChain and Azure OpenAI, featuring LangSmith tracing for monitoring and debugging.

## ⚡ Quick Start (Simple Chat App)

1. **Create `.env` file** with your Azure OpenAI credentials:
   ```env
   AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
   AZURE_OPENAI_API_KEY=your-api-key-here
   AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
   AZURE_OPENAI_MODEL=gpt-35-turbo
   AZURE_OPENAI_API_VERSION=2024-02-01
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the simple chat app**:
   ```bash
   cd openai
   python simple_chat_app.py
   ```

## 🚀 Full Setup Guide

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Azure OpenAI Setup

#### Prerequisites
1. **Azure Subscription**: You need an active Azure subscription
2. **Azure OpenAI Service**: Request access to Azure OpenAI Service (approval required)

#### Step-by-Step Azure OpenAI Configuration

1. **Create Azure OpenAI Resource**
   ```bash
   # Using Azure CLI (optional)
   az cognitiveservices account create \
     --name your-openai-resource \
     --resource-group your-resource-group \
     --kind OpenAI \
     --sku S0 \
     --location eastus
   ```

2. **Deploy a Model**
   - Go to Azure OpenAI Studio: https://oai.azure.com/
   - Navigate to "Deployments" → "Create new deployment"
   - Choose a model (e.g., `gpt-35-turbo` or `gpt-4`)
   - Set deployment name (e.g., `my-gpt-35-turbo`)
   - Configure deployment settings

3. **Get Your Credentials**
   - **Endpoint**: Found in Azure Portal → Your OpenAI Resource → Overview
   - **API Key**: Found in Azure Portal → Your OpenAI Resource → Keys and Endpoint
   - **Deployment Name**: The name you gave your model deployment

### 3. Environment Setup

Create a `.env` file in the project root with the following variables:

```env
# Azure OpenAI Configuration (Required for simple_chat_app.py)
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_MODEL=gpt-35-turbo
AZURE_OPENAI_API_VERSION=2024-02-01

# LangSmith Configuration (Optional - for advanced monitoring)
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your-langsmith-api-key
LANGSMITH_PROJECT=langchain-azure-chat
```

> **⚠️ Security Note**: Never commit your `.env` file to version control. It's already excluded in `.gitignore`.

### 4. Run Applications

#### Simple Chat App (OpenAI Direct API)
Navigate to the OpenAI directory and run the simple chat application:

```bash
cd openai
python simple_chat_app.py
```

**What it does:**
- Uses Azure OpenAI's direct API (not LangChain)
- Sends a single predefined message to the AI
- Demonstrates basic Azure OpenAI integration
- Prints environment configuration for debugging

**Expected Output:**
```
Using endpoint: https://your-resource-name.openai.azure.com/
Using model: gpt-35-turbo
Using deployment: your-deployment-name
Using subscription_key: sk-***...
-------------------------------------------------------
[AI response about Paris travel recommendations]
```

**Troubleshooting:**
- If you see `None` values in the output, check your `.env` file configuration
- Ensure your Azure OpenAI resource is deployed and accessible
- Verify your API key has the correct permissions

#### Advanced Chat App (LangChain)
```bash
python simple_chat_app.py
```
Feature-rich chat app with conversation memory and LangChain integration.

#### Jupyter Notebook
```bash
jupyter lab langchain_azure_chat.ipynb
```
Interactive notebook for experimentation and learning.

## 📋 Features

### Simple Chat App (`simple_chat_app.py`)
- ✅ Basic conversation with memory
- ✅ LangSmith tracing integration
- ✅ Error handling
- ✅ Single message mode

### Advanced Chat App (`advanced_chat_app.py`)
- ✅ Windowed conversation memory
- ✅ Custom system prompts
- ✅ Command system (`/help`, `/history`, `/clear`, etc.)
- ✅ Conversation export
- ✅ Streaming responses
- ✅ Async chat loop
- ✅ Rich error handling

### Jupyter Notebook (`langchain_azure_chat.ipynb`)
- ✅ Step-by-step examples
- ✅ Interactive chat class
- ✅ Memory management demonstrations
- ✅ LangSmith integration examples

## 🎯 Available Commands (Advanced App)

- `/system <prompt>` - Set custom system prompt
- `/history` - Show conversation history
- `/clear` - Clear conversation memory
- `/export` - Export conversation to file
- `/help` - Show available commands
- `/quit` or `/exit` - End conversation

## 🔍 LangSmith Monitoring

With LangSmith tracing enabled, you can monitor your conversations at:
**https://smith.langchain.com**

### What you can see:
- 📊 Input/output for each LLM call
- 💰 Token usage and cost tracking
- ⏱️ Latency and performance metrics
- 🔗 Chain execution details
- 🐛 Error tracking and debugging

## 🛠️ Development

### Project Structure
```
langchain/
├── .env                          # Environment variables (create this)
├── .gitignore                   # Git ignore rules (excludes .env)
├── requirements.txt              # Python dependencies
├── README.md                    # This file
├── simple_chat_app.py           # LangChain-based chat application
├── advanced_chat_app.py         # Advanced chat with features
├── langchain_azure_chat.ipynb   # Interactive notebook
└── openai/                      # Direct OpenAI API examples
    └── simple_chat_app.py       # Basic Azure OpenAI integration
```

**Key Files:**
- `openai/simple_chat_app.py` - Direct Azure OpenAI API usage (recommended for beginners)
- `simple_chat_app.py` - LangChain-based implementation with memory
- `advanced_chat_app.py` - Full-featured chat application

### Key Dependencies
- `langchain` - LangChain framework
- `langchain-openai` - Azure OpenAI integration
- `langsmith` - Tracing and monitoring
- `python-dotenv` - Environment variable management
- `openai` - OpenAI Python client

## 🔧 Customization

### Modify System Prompts
```python
# In simple_chat_app.py
system_prompt = "Your custom system prompt here"

# In advanced_chat_app.py - use command
/system Your custom system prompt here
```

### Adjust Memory Window
```python
# Change the number of conversation turns to remember
chat_app = AdvancedChatApp(window_size=20)
```

### Modify Model Parameters
```python
llm = AzureChatOpenAI(
    # ... other params
    temperature=0.9,      # More creative (0.0-1.0)
    max_tokens=2000,     # Longer responses
)
```

## 🎓 Learning Resources

1. **LangChain Documentation**: https://python.langchain.com/
2. **Azure OpenAI Service**: https://azure.microsoft.com/en-us/products/ai-services/openai-service
3. **LangSmith Documentation**: https://docs.smith.langchain.com/

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## 📝 License

This project is for educational purposes. Please ensure you comply with Azure OpenAI and LangChain licensing terms.
