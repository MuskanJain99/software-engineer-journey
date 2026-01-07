Data Structure: How will you store a todo?

What information does each todo need? (id, text, completed status, etc.)
Example: { id: 1, text: "Buy groceries", completed: false }


File Storage: Where will todos be saved?

Answer: A todos.json file in your project folder


Commands: What are the exact commands?

node todo.js add "text" → adds a todo
node todo.js list → shows all todos
node todo.js done 1 → marks todo 1 as complete
node todo.js delete 1 → removes todo 1


Algorithm for each command:

For add: Read todos.json → add new todo → write back to todos.json
For list: Read todos.json → display formatted → done
For done: Read todos.json → find todo with id → set completed=true → write back
For delete: Read todos.json → remove todo with id → write back
