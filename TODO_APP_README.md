# CLI Todo App

A simple command-line todo application built with Node.js.

## How to Use

### Add a todo
```bash
node todo.js add "Buy groceries"
```

### List all todos
```bash
node todo.js list
```

### Mark a todo as done
```bash
node todo.js done 1
```

### Delete a todo
```bash
node todo.js delete 1
```

## How It Works

1. Todos are stored in `todos.json`
2. Each todo has: id, text, completed status, createdAt timestamp
3. Commands read/write to the file each time

## What I Learned

- Node.js `fs` module for file I/O
- `process.argv` for command-line arguments
- JSON parsing and serialization
- Function composition and modular code