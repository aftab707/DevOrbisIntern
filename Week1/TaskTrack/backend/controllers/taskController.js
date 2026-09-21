const Task = require('../models/Task');

// @desc    Get all tasks for the logged in user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        // Fetch only tasks that belong to the user making the request (req.user.id comes from the middleware)
        const tasks = await Task.find({ user: req.user.id });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    try {
        const { title, description, status, dueDate } = req.body;
        
        // Validation: Title is required
        if (!title) {
            return res.status(400).json({ message: 'Task title is required' });
        }

        // Create the task and associate it with the logged in user
        const task = await Task.create({
            title,
            description,
            status,
            dueDate,
            user: req.user.id 
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Update a specific task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Authorization check: Make sure the logged in user actually owns this task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to update this task' });
        }

        // Update the task with the new data from req.body
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return the updated document and run schema validations
        );

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Delete a specific task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Authorization check: Make sure the logged in user actually owns this task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to delete this task' });
        }

        // Delete the task
        await task.deleteOne();
        res.status(200).json({ message: 'Task deleted successfully', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask
};
