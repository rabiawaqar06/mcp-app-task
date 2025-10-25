// Global variables
let todos = [];
let currentFilter = 'all';
let editingTodoId = null;
let deletingTodoId = null;

// DOM elements
const todoForm = document.getElementById('todoForm');
const todoList = document.getElementById('todoList');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const editForm = document.getElementById('editForm');

// Stats elements
const totalTodos = document.getElementById('totalTodos');
const pendingTodos = document.getElementById('pendingTodos');
const completedTodos = document.getElementById('completedTodos');

// API Base URL
const API_BASE = '';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadTodos();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Todo form submission
    todoForm.addEventListener('submit', handleAddTodo);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            setFilter(filter);
        });
    });
    
    // Edit modal
    document.getElementById('closeModal').addEventListener('click', closeEditModal);
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    editForm.addEventListener('submit', handleEditTodo);
    
    // Delete modal
    document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDelete').addEventListener('click', confirmDelete);
    
    // Close modals when clicking outside
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
    });
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });
}

// API functions
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        showNotification('Error: ' + error.message, 'error');
        throw error;
    }
}

// Load all todos
async function loadTodos() {
    try {
        showLoading(true);
        todos = await apiRequest(`${API_BASE}/todos`);
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('Failed to load todos:', error);
    } finally {
        showLoading(false);
    }
}

// Add new todo
async function handleAddTodo(e) {
    e.preventDefault();
    
    const title = document.getElementById('todoTitle').value.trim();
    const description = document.getElementById('todoDescription').value.trim();
    
    if (!title) return;
    
    try {
        const newTodo = await apiRequest(`${API_BASE}/todos`, {
            method: 'POST',
            body: JSON.stringify({
                title,
                description: description || null,
                completed: false
            })
        });
        
        todos.unshift(newTodo);
        renderTodos();
        updateStats();
        todoForm.reset();
        showNotification('Todo added successfully!', 'success');
    } catch (error) {
        console.error('Failed to add todo:', error);
    }
}

// Edit todo
async function handleEditTodo(e) {
    e.preventDefault();
    
    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const completed = document.getElementById('editCompleted').checked;
    
    if (!title) return;
    
    try {
        const updatedTodo = await apiRequest(`${API_BASE}/todos/${editingTodoId}`, {
            method: 'PUT',
            body: JSON.stringify({
                title,
                description: description || null,
                completed
            })
        });
        
        const index = todos.findIndex(todo => todo.id === editingTodoId);
        if (index !== -1) {
            todos[index] = updatedTodo;
        }
        
        renderTodos();
        updateStats();
        closeEditModal();
        showNotification('Todo updated successfully!', 'success');
    } catch (error) {
        console.error('Failed to update todo:', error);
    }
}

// Delete todo
async function confirmDelete() {
    try {
        await apiRequest(`${API_BASE}/todos/${deletingTodoId}`, {
            method: 'DELETE'
        });
        
        todos = todos.filter(todo => todo.id !== deletingTodoId);
        renderTodos();
        updateStats();
        closeDeleteModal();
        showNotification('Todo deleted successfully!', 'success');
    } catch (error) {
        console.error('Failed to delete todo:', error);
    }
}

// Toggle todo completion
async function toggleTodo(todoId) {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    try {
        const updatedTodo = await apiRequest(`${API_BASE}/todos/${todoId}`, {
            method: 'PUT',
            body: JSON.stringify({
                title: todo.title,
                description: todo.description,
                completed: !todo.completed
            })
        });
        
        const index = todos.findIndex(t => t.id === todoId);
        if (index !== -1) {
            todos[index] = updatedTodo;
        }
        
        renderTodos();
        updateStats();
        showNotification(`Todo marked as ${updatedTodo.completed ? 'completed' : 'pending'}!`, 'success');
    } catch (error) {
        console.error('Failed to toggle todo:', error);
    }
}

// Render todos
function renderTodos() {
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '';
        emptyState.style.display = currentFilter === 'all' ? 'block' : 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    
    todoList.innerHTML = filteredTodos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <div class="todo-header">
                <div>
                    <div class="todo-title">${escapeHtml(todo.title)}</div>
                    ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
                </div>
            </div>
            <div class="todo-meta">
                <span><i class="fas fa-calendar"></i> ${formatDate(todo.created_at)}</span>
                <span>${todo.completed ? '<i class="fas fa-check-circle"></i> Completed' : '<i class="fas fa-clock"></i> Pending'}</span>
            </div>
            <div class="todo-actions">
                <button class="btn ${todo.completed ? 'btn-secondary' : 'btn-success'}" onclick="toggleTodo('${todo.id}')">
                    <i class="fas fa-${todo.completed ? 'undo' : 'check'}"></i>
                    ${todo.completed ? 'Mark Pending' : 'Mark Complete'}
                </button>
                <button class="btn btn-primary" onclick="openEditModal('${todo.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="openDeleteModal('${todo.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Get filtered todos
function getFilteredTodos() {
    switch (currentFilter) {
        case 'completed':
            return todos.filter(todo => todo.completed);
        case 'pending':
            return todos.filter(todo => !todo.completed);
        default:
            return todos;
    }
}

// Set filter
function setFilter(filter) {
    currentFilter = filter;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    renderTodos();
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    
    totalTodos.textContent = total;
    completedTodos.textContent = completed;
    pendingTodos.textContent = pending;
}

// Modal functions
function openEditModal(todoId) {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    editingTodoId = todoId;
    document.getElementById('editTitle').value = todo.title;
    document.getElementById('editDescription').value = todo.description || '';
    document.getElementById('editCompleted').checked = todo.completed;
    
    editModal.classList.add('show');
    editModal.style.display = 'flex';
}

function closeEditModal() {
    editModal.classList.remove('show');
    editModal.style.display = 'none';
    editingTodoId = null;
}

function openDeleteModal(todoId) {
    deletingTodoId = todoId;
    deleteModal.classList.add('show');
    deleteModal.style.display = 'flex';
}

function closeDeleteModal() {
    deleteModal.classList.remove('show');
    deleteModal.style.display = 'none';
    deletingTodoId = null;
}

// Utility functions
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    // Add animation keyframes
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

