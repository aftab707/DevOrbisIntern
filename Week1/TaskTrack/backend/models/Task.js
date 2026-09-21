const mongoose = require('mongoose');

// 1. Define the structure of a Task document
const taskSchema = new mongoose.Schema({
    // Link this task to a specific User (Data Scoping)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a task title']
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'], // Only these values are allowed
        default: 'pending'
    },
    dueDate: {
        type: Date
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the model
module.exports = mongoose.model('Task', taskSchema);
