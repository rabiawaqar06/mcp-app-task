from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import os

# Initialize FastAPI app
app = FastAPI(title="Todo List API", description="A simple todo list API", version="1.0.0")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic models
class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

class Todo(TodoBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# In-memory storage (in a real app, you'd use a database)
todos_db: List[Todo] = []

@app.get("/")
async def root():
    return FileResponse("static/index.html")

@app.get("/api")
async def api_info():
    return {"message": "Welcome to the Todo List API! Visit /docs for API documentation."}

@app.get("/todos", response_model=List[Todo])
async def get_todos():
    """Get all todos"""
    return todos_db

@app.get("/todos/{todo_id}", response_model=Todo)
async def get_todo(todo_id: str):
    """Get a specific todo by ID"""
    for todo in todos_db:
        if todo.id == todo_id:
            return todo
    raise HTTPException(status_code=404, detail="Todo not found")

@app.post("/todos", response_model=Todo)
async def create_todo(todo: TodoCreate):
    """Create a new todo"""
    todo_id = str(uuid.uuid4())
    now = datetime.now()
    
    new_todo = Todo(
        id=todo_id,
        title=todo.title,
        description=todo.description,
        completed=todo.completed,
        created_at=now,
        updated_at=now
    )
    
    todos_db.append(new_todo)
    return new_todo

@app.put("/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: str, todo_update: TodoUpdate):
    """Update a specific todo"""
    for i, todo in enumerate(todos_db):
        if todo.id == todo_id:
            # Update only provided fields
            update_data = todo_update.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(todo, field, value)
            todo.updated_at = datetime.now()
            todos_db[i] = todo
            return todo
    
    raise HTTPException(status_code=404, detail="Todo not found")

@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str):
    """Delete a specific todo"""
    for i, todo in enumerate(todos_db):
        if todo.id == todo_id:
            del todos_db[i]
            return {"message": "Todo deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Todo not found")

@app.get("/todos/completed", response_model=List[Todo])
async def get_completed_todos():
    """Get all completed todos"""
    return [todo for todo in todos_db if todo.completed]

@app.get("/todos/pending", response_model=List[Todo])
async def get_pending_todos():
    """Get all pending (incomplete) todos"""
    return [todo for todo in todos_db if not todo.completed]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
