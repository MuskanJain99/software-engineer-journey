const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

const TODOS_FILE = path.join(__dirname, 'todos.json');

// ===== HELPER FUNCTIONS (same as before) =====

function readTodos() {
  try {
    if (fs.existsSync(TODOS_FILE)) {
      const data = fs.readFileSync(TODOS_FILE, 'utf-8');
      if (data.trim() === '') {
        return [];
      }
      return JSON.parse(data);
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error('⚠️  todos.json is corrupted. Resetting.');
      writeTodos([]);
      return [];
    }
  }
  return [];
}

function writeTodos(todos) {
  try {
    fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2));
  } catch (err) {
    console.error('Error writing todos:', err.message);
  }
}

function getNextId(todos) {
  if (todos.length === 0) return 1;
  return Math.max(...todos.map(t => t.id)) + 1;
}

// ===== API FUNCTIONS =====

function addTodo(text) {
  const todos = readTodos();
  const newTodo = {
    id: getNextId(todos),
    text: text,
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.push(newTodo);
  writeTodos(todos);
  return newTodo;
}

function getTodos() {
  return readTodos();
}

function markTodoDone(id) {
  const todos = readTodos();
  const todo = todos.find(t => t.id === parseInt(id));
  if (!todo) return null;
  
  todo.completed = true;
  writeTodos(todos);
  return todo;
}

function deleteTodo(id) {
  const todos = readTodos();
  const index = todos.findIndex(t => t.id === parseInt(id));
  if (index === -1) return null;
  
  const deleted = todos[index];
  todos.splice(index, 1);
  writeTodos(todos);
  return deleted;
}

// ===== HTTP SERVER =====

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Enable CORS (so browser can talk to server)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Route: GET /api/todos - Get all todos
  if (pathname === '/api/todos' && req.method === 'GET') {
    const todos = getTodos();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(todos));
    return;
  }

  // Route: POST /api/todos - Add a new todo
  if (pathname === '/api/todos' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { text } = JSON.parse(body);
        if (!text) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Text is required' }));
          return;
        }
        const newTodo = addTodo(text);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newTodo));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Route: PUT /api/todos/:id - Mark todo as done
  if (pathname.match(/^\/api\/todos\/\d+$/) && req.method === 'PUT') {
    const id = pathname.split('/')[3];
    const todo = markTodoDone(id);
    if (!todo) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Todo not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(todo));
    return;
  }

  // Route: DELETE /api/todos/:id - Delete a todo
  if (pathname.match(/^\/api\/todos\/\d+$/) && req.method === 'DELETE') {
    const id = pathname.split('/')[3];
    const deleted = deleteTodo(id);
    if (!deleted) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Todo not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(deleted));
    return;
  }

  // Route: GET / - Serve index.html
  if (pathname === '/' || pathname === '/index.html') {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('404 - File not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  // Route: GET /style.css - Serve CSS
  if (pathname === '/style.css') {
    const filePath = path.join(__dirname, 'style.css');
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('404 - File not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(data);
    });
    return;
  }

  // Route: GET /app.js - Serve JavaScript
  if (pathname === '/app.js') {
    const filePath = path.join(__dirname, 'app.js');
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('404 - File not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
    return;
  }

  // 404 for everything else
  res.writeHead(404);
  res.end('404 - Not Found');
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   GET  /api/todos        - Get all todos`);
  console.log(`   POST /api/todos        - Add a todo`);
  console.log(`   PUT  /api/todos/:id    - Mark todo as done`);
  console.log(`   DELETE /api/todos/:id  - Delete a todo`);
});