import streamlit as st
import requests
import json
from typing import List, Dict

# Configure Streamlit page
st.set_page_config(
    page_title="Ollama Chatbot",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# API configuration
API_BASE_URL = "http://localhost:8000"

def get_available_models() -> List[str]:
    """Get available models from the FastAPI backend"""
    try:
        response = requests.get(f"{API_BASE_URL}/models")
        if response.status_code == 200:
            return response.json()
        else:
            st.error(f"Failed to fetch models: {response.status_code}")
            return ["llama2"]  # fallback
    except requests.exceptions.RequestException as e:
        st.error(f"Error connecting to API: {e}")
        return ["llama2"]  # fallback

def send_message(message: str, model: str, conversation_history: List[Dict]) -> Dict:
    """Send message to FastAPI backend"""
    try:
        payload = {
            "message": message,
            "model": model,
            "conversation_history": conversation_history
        }
        
        response = requests.post(
            f"{API_BASE_URL}/chat",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            st.error(f"API Error: {response.status_code} - {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        st.error(f"Connection error: {e}")
        return None

def check_api_health() -> bool:
    """Check if the FastAPI backend is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def main():
    st.title("🤖 Ollama Chatbot")
    st.markdown("Chat with your local LLM using Ollama")
    
    # Sidebar for configuration
    with st.sidebar:
        st.header("Configuration")
        
        # Check API health
        if check_api_health():
            st.success("✅ API Connected")
        else:
            st.error("❌ API Disconnected")
            st.info("Make sure the FastAPI server is running on port 8000")
            return
        
        # Model selection
        available_models = get_available_models()
        if available_models:
            selected_model = st.selectbox(
                "Select Model",
                available_models,
                index=0
            )
        else:
            st.error("No models available")
            return
        
        # Clear conversation button
        if st.button("🗑️ Clear Conversation"):
            st.session_state.messages = []
            st.rerun()
        
        # Display model info
        st.markdown("---")
        st.markdown(f"**Current Model:** {selected_model}")
        
        # Instructions
        st.markdown("---")
        st.markdown("### How to use:")
        st.markdown("1. Make sure Ollama is running locally")
        st.markdown("2. Select a model from the dropdown")
        st.markdown("3. Type your message and press Enter")
        st.markdown("4. The AI will respond using the selected model")

    # Initialize chat history
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # Display chat messages from history on app rerun
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # Accept user input
    if prompt := st.chat_input("What would you like to know?"):
        # Add user message to chat history
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        # Display user message in chat message container
        with st.chat_message("user"):
            st.markdown(prompt)

        # Get AI response
        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                # Prepare conversation history for API
                conversation_history = [
                    {"role": msg["role"], "content": msg["content"]} 
                    for msg in st.session_state.messages[:-1]  # Exclude the current message
                ]
                
                response_data = send_message(prompt, selected_model, conversation_history)
                
                if response_data:
                    ai_response = response_data["response"]
                    st.markdown(ai_response)
                    
                    # Add assistant response to chat history
                    st.session_state.messages.append({"role": "assistant", "content": ai_response})
                else:
                    error_msg = "Sorry, I couldn't process your request. Please try again."
                    st.markdown(error_msg)
                    st.session_state.messages.append({"role": "assistant", "content": error_msg})

    # Display conversation statistics
    if st.session_state.messages:
        st.sidebar.markdown("---")
        st.sidebar.markdown("### Conversation Stats")
        user_messages = len([msg for msg in st.session_state.messages if msg["role"] == "user"])
        assistant_messages = len([msg for msg in st.session_state.messages if msg["role"] == "assistant"])
        st.sidebar.markdown(f"**Messages:** {user_messages} user, {assistant_messages} assistant")

if __name__ == "__main__":
    main()
