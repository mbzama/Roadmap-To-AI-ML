"""
This file creates a FastAPI web server that serves a LangChain translation chain using the Groq API. Here's what it does:

Core Functionality
Translation Service: Translates text from one language to another using AI
API Endpoint: Exposes the translation functionality via HTTP REST API
LangChain Integration: Uses LangChain's pipeline architecture for AI workflow

"""

from fastapi import FastAPI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
from langserve import add_routes

import os
from dotenv import load_dotenv

load_dotenv("../.env")

if "GROQ_API_KEY" not in os.environ:
    raise ValueError("GROQ_API_KEY environment variable is not set.")   

model = ChatGroq(
    model="gemma2-9b-it",
    api_key=os.getenv("GROQ_API_KEY")
)

print("Model initialized successfully.")
print(model)

system_prompt_template = "Translate the following text into {language}:"
prompt_template = ChatPromptTemplate.from_messages(    [
        ("system", system_prompt_template),
        ("user", "{text}")
    ]
)

parser = StrOutputParser()

# Create chain
chain = prompt_template | model  | parser

app = FastAPI(
    title="Langchain Server", 
    version="1.0", 
    description="A server for Langchain models using Groq."
)

# Add routes with simplified configuration to avoid pydantic issues
add_routes(
    app,
    chain,
    path="/chain",
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

