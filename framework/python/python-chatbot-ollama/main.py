from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
import logging
from typing import List, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Ollama Chatbot API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = "llama2"
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str
    model: str
    conversation_history: List[ChatMessage]

class ModelInfo(BaseModel):
    name: str
    size: Optional[str] = None
    modified_at: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Ollama Chatbot API is running!"}

@app.get("/models", response_model=List[str])
async def get_available_models():
    """Get list of available Ollama models"""
    try:
        models = ollama.list()
        model_names = [model['name'] for model in models['models']]
        return model_names
    except Exception as e:
        logger.error(f"Error fetching models: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching models: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_with_ollama(request: ChatRequest):
    """Send a message to Ollama and get a response"""
    try:
        # Prepare conversation history
        messages = []
        
        # Add previous conversation history
        for msg in request.conversation_history:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        # Get response from Ollama
        response = ollama.chat(
            model=request.model,
            messages=messages
        )
        
        ai_response = response['message']['content']
        
        # Update conversation history
        updated_history = request.conversation_history + [
            ChatMessage(role="user", content=request.message),
            ChatMessage(role="assistant", content=ai_response)
        ]
        
        return ChatResponse(
            response=ai_response,
            model=request.model,
            conversation_history=updated_history
        )
        
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Stream chat response from Ollama"""
    try:
        messages = []
        
        for msg in request.conversation_history:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        stream = ollama.chat(
            model=request.model,
            messages=messages,
            stream=True
        )
        
        for chunk in stream:
            yield f"data: {chunk['message']['content']}\n\n"
            
    except Exception as e:
        logger.error(f"Error in stream chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in stream chat: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test Ollama connection
        models = ollama.list()
        return {
            "status": "healthy",
            "ollama_connected": True,
            "available_models": len(models['models'])
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "ollama_connected": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
