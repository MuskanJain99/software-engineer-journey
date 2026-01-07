// API Base URL
const API_URL = '/api/todos';

// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

// ===== FETCH TODOS FROM SERVER =====

async function loadTodos() {
  try {
    const response = await fetch(API_URL);
    const todos = await response.json();
    renderTodos(todos);
  } catch (err) {
    console.error('Error loading todos:', err);
  }
}

// ===== ADD A TODO =====

async function addTodo() {
  const text = todoInput.value.trim();
  
  if (!text) {
    alert('Please enter a todo');
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    const newTodo = await response.json();
    todoInput.value = '';
    loadTodos();
  } catch (err) {
    console.error('Error adding todo:', err);
  }
}

// ===== MARK TODO AS DONE =====

async function markDone(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const updatedTodo = await response.json();
    loadTodos();
  } catch (err) {
    console.error('Error marking todo done:', err);
  }
}

// ===== DELETE TODO =====

async function deleteTodo(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    loadTodos();
  } catch (err) {
    console.error('Error deleting todo:', err);
  }
}

// ===== RENDER TODOS =====

function renderTodos(todos) {
  todoList.innerHTML = '';

  if (todos.length === 0) {
    todoList.innerHTML = '<div class="empty-message">No todos yet. Add one above!</div>';
    return;
  }

  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

    li.innerHTML = `
      <input 
        type="checkbox" 
        class="todo-checkbox" 
        ${todo.completed ? 'checked' : ''}
        onchange="markDone(${todo.id})"
      >
      <span class="todo-text">${todo.text}</span>
      <button class="todo-delete" onclick="deleteTodo(${todo.id})">Delete</button>
    `;

    todoList.appendChild(li);
  });
}

// ===== EVENT LISTENERS =====

addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTodo();
  }
});

// Load todos when page opens
loadTodos();
