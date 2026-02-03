// signup.js - TEMPORARY VERSION FOR DEBUGGING
const User = require('../auth/user.model');

const signup = async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      console.log('Missing fields');
      return res.status(400).json({ 
        message: 'Please provide name, email, and password' 
      });
    }

    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Creating user...');
    const user = await User.create({ name, email, password });
    console.log('User created:', user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    // Direct response for now
    res.status(500).json({ 
      error: err.message,
      stack: err.stack 
    });
  }
};

module.exports = signup;