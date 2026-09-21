const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Define the structure of a User document
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true // Ensures no two users can register with the same email
    },
    password: {
        type: String,
        required: [true, 'Please provide a password']
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// 2. Hash the password BEFORE saving it to the database
userSchema.pre('save', async function (next) {
    // If password is not modified, move on (e.g. if updating only the name)
    if (!this.isModified('password')) {
        next();
    }

    // Generate a random salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 3. Method to compare the plain text password with the hashed database password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model so it can be used in the controllers
module.exports = mongoose.model('User', userSchema);
