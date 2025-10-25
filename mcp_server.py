from fastmcp.server import FastMCP
import requests
import json
from typing import List, Optional

# Initialize FastMCP server
mcp = FastMCP("todo-mcp-server")

# Base URL for the FastAPI todo application
API_BASE_URL = "http://127.0.0.1:8000"

@mcp.tool()
def get_todos() -> List[dict]:
    """Get all todos from the todo list application."""
    try:
        response = requests.get(f"{API_BASE_URL}/todos")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to fetch todos: {str(e)}"}

@mcp.tool()
def get_todo_by_id(todo_id: str) -> dict:
    """Get a specific todo by its ID."""
    try:
        response = requests.get(f"{API_BASE_URL}/todos/{todo_id}")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to fetch todo: {str(e)}"}

@mcp.tool()
def create_todo(title: str, description: str = "", completed: bool = False) -> dict:
    """Create a new todo item."""
    try:
        payload = {
            "title": title,
            "description": description,
            "completed": completed
        }
        response = requests.post(f"{API_BASE_URL}/todos", json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to create todo: {str(e)}"}

@mcp.tool()
def update_todo(todo_id: str, title: Optional[str] = None, description: Optional[str] = None, completed: Optional[bool] = None) -> dict:
    """Update an existing todo item."""
    try:
        # First get the current todo to preserve existing values
        current_todo = get_todo_by_id(todo_id)
        if "error" in current_todo:
            return current_todo
        
        # Prepare update payload with only provided fields
        update_payload = {}
        if title is not None:
            update_payload["title"] = title
        if description is not None:
            update_payload["description"] = description
        if completed is not None:
            update_payload["completed"] = completed
        
        response = requests.put(f"{API_BASE_URL}/todos/{todo_id}", json=update_payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to update todo: {str(e)}"}

@mcp.tool()
def delete_todo(todo_id: str) -> dict:
    """Delete a todo item by its ID."""
    try:
        response = requests.delete(f"{API_BASE_URL}/todos/{todo_id}")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to delete todo: {str(e)}"}

@mcp.tool()
def get_completed_todos() -> List[dict]:
    """Get all completed todos."""
    try:
        response = requests.get(f"{API_BASE_URL}/todos/completed")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to fetch completed todos: {str(e)}"}

@mcp.tool()
def get_pending_todos() -> List[dict]:
    """Get all pending (incomplete) todos."""
    try:
        response = requests.get(f"{API_BASE_URL}/todos/pending")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to fetch pending todos: {str(e)}"}

@mcp.tool()
def mark_todo_complete(todo_id: str) -> dict:
    """Mark a todo as completed."""
    return update_todo(todo_id, completed=True)

@mcp.tool()
def mark_todo_pending(todo_id: str) -> dict:
    """Mark a todo as pending (incomplete)."""
    return update_todo(todo_id, completed=False)

@mcp.tool()
def get_todo_stats() -> dict:
    """Get statistics about todos (total, completed, pending)."""
    try:
        all_todos = get_todos()
        if "error" in all_todos:
            return all_todos
        
        total = len(all_todos)
        completed = len([todo for todo in all_todos if todo.get("completed", False)])
        pending = total - completed
        
        return {
            "total": total,
            "completed": completed,
            "pending": pending,
            "completion_rate": round((completed / total * 100) if total > 0 else 0, 2)
        }
    except Exception as e:
        return {"error": f"Failed to get stats: {str(e)}"}

if __name__ == "__main__":
    mcp.run()
