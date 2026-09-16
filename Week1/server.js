// 1. Import the Express library
    const express = require('express');
    
// 2. Initialize the Express application
    const app = express();
// 3. Start the server on a specific port (e.g., 5000)
    const PORT = 5000;
// --- MIDDLEWARE ---
// THIS build in middleware tells express to accept incoming data in JSON format
    app.use(express.json());

// --- IN-MEMORY DATA STORE ---
// Simulating a database for today. Tomorrow I replace this with MongoDB!
let tasks = [
    {id: 1, title: "Learning Express Basics", status:"completed"},
    {id: 2, title: "Build CRUD API", status:"pending"}
];

// --- Rounting & REST Conventions ---

// 1: READ ALL (GET request)
app.get('/api/tasks',(req, res) => {
    res.json(tasks);
});


app.get('/',(req, res) => {
    res.send('Home page')
});

// 2: READ ONE BY ID (GET Request)
app.get('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);

    if(!task){
        return res.status(404).json({ message: "Task not"});
    }
    res.json(task);
});

    // 3. CREATE (POST Request)
    app.post('/api/tasks', (req, res) => {
        const newTask = {
            id: tasks.length + 1,
            title: req.body.title,      // Extracted from the incoming JSON via our middleware!
            status: req.body.status || "pending"
        };
        tasks.push(newTask);
        // HTTP Status 201 means "Created successfully"
        res.status(201).json(newTask); 
    });

        // 4. UPDATE (PUT Request)
    app.put('/api/tasks/:id', (req, res) => {
        const taskId = parseInt(req.params.id);
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) return res.status(404).json({ message: "Task not found" });
        
        // Update fields if they were provided in the request
        task.title = req.body.title || task.title;
        task.status = req.body.status || task.status;
        
        res.json(task); // Send back the updated task
    });

        // 5. DELETE (DELETE Request)
    app.delete('/api/tasks/:id', (req, res) => {
        const taskId = parseInt(req.params.id);
        tasks = tasks.filter(t => t.id !== taskId); // Filter out the deleted task
        
        res.json({ message: "Task deleted successfully" });
    });

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
