import os
from dotenv import load_dotenv
from langchain_community.llms import Ollama
import streamlit as st
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Load environment variables from .env file
load_dotenv()

os.environ["LANGSMITH_TRACING"] = os.getenv("LANGSMITH_TRACING")
os.environ["LANGSMITH_ENDPOINT"] = os.getenv("LANGSMITH_ENDPOINT")
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
os.environ["LANGSMITH_PROJECT"] = os.getenv("LANGSMITH_PROJECT")
os.environ["LANGSMITH_TRACING_V2"] = os.getenv("LANGSMITH_TRACING_V2")

## Prompt Template
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant. Please respond to the question asked"),
        ("user", "Question: {question}"),
    ]
)

## streamlit app
st.set_page_config(page_title="Ollama LLM", page_icon=":robot:")
st.title("Chatbot with llama2 LLM + LangSmith Tracing")
input_question = st.text_input("Enter your query:")

## Ollama LLM model
llm = Ollama(model="llama2")
output_parser = StrOutputParser()

chain = prompt | llm | output_parser

if input_question:
    st.write(chain.invoke({"question": input_question}))

