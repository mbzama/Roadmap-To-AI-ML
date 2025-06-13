import asyncio
import aiohttp
import json
from typing import AsyncGenerator

async def test_ollama_connection():
    """Test basic Ollama connection"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get('http://localhost:11434/api/tags') as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ Ollama is running!")
                    print(f"Available models: {[model['name'] for model in data['models']]}")
                    return True
                else:
                    print(f"❌ Ollama connection failed: {response.status}")
                    return False
    except Exception as e:
        print(f"❌ Error connecting to Ollama: {e}")
        return False

async def test_fastapi_connection():
    """Test FastAPI connection"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get('http://localhost:8000/health') as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ FastAPI is running!")
                    print(f"Health status: {data}")
                    return True
                else:
                    print(f"❌ FastAPI connection failed: {response.status}")
                    return False
    except Exception as e:
        print(f"❌ Error connecting to FastAPI: {e}")
        return False

async def test_chat_endpoint():
    """Test the chat endpoint"""
    try:
        payload = {
            "message": "Hello, how are you?",
            "model": "llama2",
            "conversation_history": []
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                'http://localhost:8000/chat',
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ Chat endpoint working!")
                    print(f"Response: {data['response'][:100]}...")
                    return True
                else:
                    print(f"❌ Chat endpoint failed: {response.status}")
                    text = await response.text()
                    print(f"Error: {text}")
                    return False
    except Exception as e:
        print(f"❌ Error testing chat endpoint: {e}")
        return False

async def main():
    """Run all tests"""
    print("🧪 Testing Ollama Chatbot Components\n")
    
    print("1. Testing Ollama connection...")
    ollama_ok = await test_ollama_connection()
    print()
    
    print("2. Testing FastAPI connection...")
    fastapi_ok = await test_fastapi_connection()
    print()
    
    if ollama_ok and fastapi_ok:
        print("3. Testing chat endpoint...")
        chat_ok = await test_chat_endpoint()
        print()
        
        if chat_ok:
            print("🎉 All tests passed! Your chatbot is ready to use.")
        else:
            print("⚠️  Chat endpoint test failed.")
    else:
        print("⚠️  Basic connections failed. Please check your setup.")
    
    print("\n📋 Setup checklist:")
    print(f"  {'✅' if ollama_ok else '❌'} Ollama running (port 11434)")
    print(f"  {'✅' if fastapi_ok else '❌'} FastAPI running (port 8000)")
    print("  🔲 Streamlit running (port 8501)")

if __name__ == "__main__":
    asyncio.run(main())
