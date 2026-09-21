const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect private routes
const protect = async (req, res, next) => {
    let token;

    // 1. Check if the Authorization header exists and starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Extract the token from the string (Format: "Bearer <token_here>")
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify the token using our secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find the user by ID (extracted from token) and attach it to the request object
            // .select('-password') ensures we don't accidentally send the password hash back
            req.user = await User.findById(decoded.id).select('-password');

            // 5. Move on to the next function (the actual controller)
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // If no token was found at all
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = { protect };
