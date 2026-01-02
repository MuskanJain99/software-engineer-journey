const fs = require('fs');  // Load file system tools
const path = require('path');  // Load path tools

// Tell Node where to save the file
const TODOS_FILE = path.join(__dirname, 'todos.json');
// __dirname = current folder, 'todos.json' = filename

// ===== HELPER FUNCTIONS =====

// Function 1: READ todos from file
function readTodos() {
  try {
    // Check if file exists
    if (fs.existsSync(TODOS_FILE)) {
      // Read file as text
      const data = fs.readFileSync(TODOS_FILE, 'utf-8');
      // Convert text to JavaScript object
      return JSON.parse(data);
    }
  } catch (err) {
    // If something goes wrong, show error
    console.error('Error reading todos:', err.message);
  }
  // If file doesn't exist, return empty list
  return [];
}

// Function 2: WRITE todos to file
function writeTodos(todos) {
  try {
    // Convert array to JSON text (null, 2 = pretty formatting)
    // Pretty formatting makes it readable:
    // [
    //   { id: 1, ... },
    //   { id: 2, ... }
    // ]
    // Instead of: [{"id":1,...},{"id":2,...}]
    fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2));
  } catch (err) {
    console.error('Error writing todos:', err.message);
  }
}

// Function 3: GET next available ID
function getNextId(todos) {
  // If no todos, next ID is 1
  if (todos.length === 0) return 1;
  
  // Otherwise, find the highest ID and add 1
  // todos.map(t => t.id) converts [todo1, todo2] to [1, 2]
  // Math.max(1, 2) returns 2
  // So next ID is 3
  return Math.max(...todos.map(t => t.id)) + 1;
}

// ===== COMMANDS =====

// Command 1: ADD a todo
function addTodo(text) {
  const todos = readTodos();  // Get current todos
  
  // Create new todo object
  const newTodo = {
    id: getNextId(todos),  // Get next ID
    text: text,             // Use the text user provided
    completed: false,       // New todos are not done
    createdAt: new Date().toISOString()  // When was it created?
  };
  
  todos.push(newTodo);  // Add to the list
  writeTodos(todos);     // Save to file
  console.log(`✓ Todo added: ${text}`);  // Show feedback
}

// Command 2: LIST all todos
function listTodos() {
  const todos = readTodos();  // Get all todos
  
  // If no todos, show message
  if (todos.length === 0) {
    console.log('No todos yet!');
    return;
  }
  
  console.log('\n--- Your Todos ---');
  
  // Loop through each todo and print it
  todos.forEach(todo => {
    // If completed, show [x], else show [ ]
    const status = todo.completed ? '[x]' : '[ ]';
    console.log(`${todo.id}. ${status} ${todo.text}`);
  });
  console.log('');
}

// Command 3: MARK todo as done
function markDone(id) {
  const todos = readTodos();  // Get all todos
  
  // Find the todo with this ID
  const todo = todos.find(t => t.id === parseInt(id));
  // parseInt(id) converts "1" to 1 (string to number)
  
  // If not found, show error
  if (!todo) {
    console.error(`Todo ${id} not found`);
    return;
  }
  
  // Mark as complete
  todo.completed = true;
  writeTodos(todos);  // Save changes
  console.log(`✓ Todo ${id} marked as done`);
}

// Command 4: DELETE a todo
function deleteTodo(id) {
  const todos = readTodos();  // Get all todos
  
  // Find position of this todo
  const index = todos.findIndex(t => t.id === parseInt(id));
  
  // If not found, show error
  if (index === -1) {
    console.error(`Todo ${id} not found`);
    return;
  }
  
  // Remove from array
  const deleted = todos[index];
  todos.splice(index, 1);  // Remove 1 item at position index
  
  writeTodos(todos);  // Save changes
  console.log(`✓ Todo ${id} deleted: ${deleted.text}`);
}

// ===== MAIN PROGRAM =====

// Get command from user
const command = process.argv[2];  // "add", "list", "done", or "delete"
const arg = process.argv[3];      // The argument (todo text or ID)

// Run the right command
switch (command) {
  case 'add':
    if (!arg) {
      console.error('Usage: node todo.js add "your todo text"');
    } else {
      addTodo(arg);
    }
    break;
  case 'list':
    listTodos();
    break;
  case 'done':
    if (!arg) {
      console.error('Usage: node todo.js done <id>');
    } else {
      markDone(arg);
    }
    break;
  case 'delete':
    if (!arg) {
      console.error('Usage: node todo.js delete <id>');
    } else {
      deleteTodo(arg);
    }
    break;
  default:
    console.log('Commands: add, list, done, delete');
}