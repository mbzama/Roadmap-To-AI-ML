#!/bin/bash

# Start FastAPI server in the background
echo "Starting FastAPI server..."
python main.py &
FASTAPI_PID=$!

# Wait a moment for FastAPI to start
sleep 3

# Start Streamlit app
echo "Starting Streamlit app..."
streamlit run streamlit_app.py --server.port 8501 --server.address 0.0.0.0

# Clean up when script exits
trap "kill $FASTAPI_PID" EXIT
