const mongoose = require('mongoose');

// Function to connect to MongoDB Atlas
const connectDB = async () => {
    try {
        // Attempt to connect using the connection string from .env
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(` MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
        // If connection fails, log the error and stop the server
        console.error(` Error connecting to MongoDB: ${error.message}`);
        process.exit(1); 
    }
};

module.exports = connectDB;
