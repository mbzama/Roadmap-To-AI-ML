import streamlit as st

from src.langgraphagenticai.ui.streamlitui.loadui import LoadStreamlitUI

def load_langgraph_agentic_app():   
    """
    Load the LangGraph Agentic AI UI using Streamlit.
    """
    ui_loader = LoadStreamlitUI()
    user_controls = ui_loader.load_streamlit_ui()
    
    # Store user controls in session state for later use
    st.session_state.user_controls = user_controls

    user_message = st.text_input("Enter your message:", "")

    if user_message:
        # Here you would typically process the user message with the selected LLM
        # For demonstration, we just display the message
        st.write(f"You entered: {user_message}")