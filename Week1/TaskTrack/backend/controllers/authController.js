const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate a JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token will be valid for 30 days
    });
};

// Helper function to validate email format
const isValidEmail = (email) => {
    // Requires a proper domain and a TLD of at least 2 alphabetical characters
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

// Helper function to validate password strength
const isValidPassword = (password) => {
    // Requires: at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation: Ensure all fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all fields (name, email, password)' });
        }

        // Validation: Check email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address (e.g., example@domain.com)' });
        }

        // Validation: Check password strength
        if (!isValidPassword(password)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character.' 
            });
        }

        // Check if a user with this email already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create the user in the database
        // Note: Password hashing is handled automatically by the pre-save hook in the User model
        const user = await User.create({
            name,
            email,
            password
        });

        // If user is created successfully, send back the user data and the token
        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data provided' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Authenticate a user (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        // Find the user by their email
        const user = await User.findOne({ email });

        // Check if user exists AND if the provided password matches the hashed password
        if (user && (await user.matchPassword(password))) {
            // Send back user data and a new token
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

module.exports = {
    registerUser,
    loginUser
};
