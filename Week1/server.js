require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// --- MIDDLEWARE ---
// This built-in middleware tells Express to accept incoming data in JSON format
app.use(express.json());

// --- ROUTES ---
// Default Home Route
app.get('/', (req, res) => {
    res.send('TaskTrack API is running...');
});

// Import and use Routes
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/authRoutes'));

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
