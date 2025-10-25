# MCP Integration with Gemini CLI

This guide explains how to integrate your FastAPI Todo List application with Gemini CLI using Model Context Protocol (MCP).

## What is MCP?

Model Context Protocol (MCP) is a standard for connecting AI assistants to external tools and data sources. It allows AI models like Gemini to interact with your applications through a standardized interface.

## Setup Instructions

### 1. Prerequisites

Make sure you have:
- Python virtual environment activated
- FastAPI todo application running
- Gemini CLI installed

### 2. Start the Services

#### Option A: Using the startup script (Recommended)
```bash
./start_services.sh
```

#### Option B: Manual startup
```bash
# Terminal 1: Start FastAPI app
source venv/bin/activate
python main.py

# Terminal 2: Start MCP server
source venv/bin/activate
python mcp_server.py
```

### 3. Configure Gemini CLI

Add the MCP server configuration to your Gemini CLI config:

```json
{
  "mcpServers": {
    "todo-mcp-server": {
      "command": "/home/adeesha-waheed/Documents/mcp/venv/bin/python",
      "args": ["mcp_server.py"],
      "cwd": "/home/adeesha-waheed/Documents/mcp"
    }
  }
}
```

**Important**: Use the full path to your virtual environment's Python interpreter to ensure all dependencies are available.

### 4. Available MCP Tools

Your MCP server provides the following tools to Gemini:

#### Todo Management
- `get_todos()` - Get all todos
- `get_todo_by_id(todo_id)` - Get a specific todo
- `create_todo(title, description, completed)` - Create a new todo
- `update_todo(todo_id, title, description, completed)` - Update a todo
- `delete_todo(todo_id)` - Delete a todo

#### Status Management
- `get_completed_todos()` - Get completed todos
- `get_pending_todos()` - Get pending todos
- `mark_todo_complete(todo_id)` - Mark todo as complete
- `mark_todo_pending(todo_id)` - Mark todo as pending

#### Analytics
- `get_todo_stats()` - Get todo statistics

## Usage Examples

Once integrated with Gemini CLI, you can ask Gemini to:

- "Show me all my todos"
- "Create a new todo called 'Buy groceries'"
- "Mark the todo with ID 'abc123' as complete"
- "What's my completion rate?"
- "Delete the todo about 'old task'"
- "Show me only pending todos"

## Testing the Integration

### Test MCP Server Directly
```bash
# Test the MCP server
python mcp_server.py
```

### Test with Gemini CLI
1. Start both services
2. Open Gemini CLI
3. Try commands like:
   - "List all my todos"
   - "Create a todo for 'Learn FastAPI'"
   - "Show me todo statistics"

## Troubleshooting

### Common Issues

1. **MCP server not starting**
   - Ensure FastAPI app is running on port 8000
   - Check virtual environment is activated
   - Verify all dependencies are installed

2. **Connection errors**
   - Verify API_BASE_URL in mcp_server.py
   - Check if FastAPI app is accessible at http://127.0.0.1:8000

3. **Gemini CLI not recognizing tools**
   - Check Gemini CLI configuration
   - Ensure MCP server is running
   - Verify tool names and parameters

### Debug Commands

```bash
# Check if FastAPI is running
curl http://localhost:8000/todos

# Test MCP server
python mcp_server.py

# Check Gemini CLI config
gemini config list
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Gemini CLI   │◄──►│   MCP Server   │◄──►│  FastAPI App   │
│                 │    │                 │    │                 │
│ - AI Assistant  │    │ - Tool Bridge   │    │ - Todo API      │
│ - User Commands │    │ - Error Handling│    │ - Web Interface │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Benefits

1. **Natural Language Interface**: Control your todo app through conversation
2. **AI-Powered Insights**: Get suggestions and analytics
3. **Automation**: Batch operations and smart filtering
4. **Integration**: Works with other MCP-enabled tools

## Next Steps

- Add more sophisticated todo management features
- Implement todo categorization
- Add due dates and reminders
- Create todo templates
- Add team collaboration features
