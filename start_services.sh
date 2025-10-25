#!/bin/bash

# Start Todo List Application with MCP Integration
echo "🚀 Starting Todo List Application with MCP Integration..."

# Activate virtual environment
source venv/bin/activate

# Start the FastAPI todo application in the background
echo "📝 Starting FastAPI Todo Application..."
python main.py &
FASTAPI_PID=$!

# Wait a moment for FastAPI to start
sleep 3

# Start the MCP server
echo "🔧 Starting MCP Server..."
python mcp_server.py &
MCP_PID=$!

echo "✅ Services started successfully!"
echo "📱 Todo App: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🔧 MCP Server: Running on stdio"
echo ""
echo "To stop services, press Ctrl+C"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $FASTAPI_PID 2>/dev/null
    kill $MCP_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait

