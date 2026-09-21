require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors'); // CORS allows our React frontend to communicate with this backend
const connectDB = require('./config/db');

// Connect to MongoDB Atlas
connectDB();

// Initialize the Express Application
const app = express();
const PORT = process.env.PORT || 5000;

// ==============================
// MIDDLEWARE
// ==============================
// 1. Enable CORS so the React app running on port 5173 can make requests here
app.use(cors());

// 2. Built-in middleware to parse incoming JSON data from request bodies
app.use(express.json());


// ==============================
// ROUTES
// ==============================
// Define a simple home route to verify the server is running
app.get('/', (req, res) => {
    res.send('TaskTrack Backend API is running perfectly!');
});

// Register the API routes
// Any request starting with /api/users will be handled by authRoutes
app.use('/api/users', require('./routes/authRoutes'));

// Any request starting with /api/tasks will be handled by taskRoutes
app.use('/api/tasks', require('./routes/taskRoutes'));


// ==============================
// START SERVER
// ==============================
app.listen(PORT, () => {
    console.log(` Backend Server is running on http://localhost:${PORT}`);
});
