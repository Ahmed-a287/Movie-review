const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;

// Registering route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    //Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);
    //Creating a new User with the hashed password
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    //Looking for a user in the database with the given e-mail
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid e-mail' });
    }
    //Looking for a user in the database with the given password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    //Generating a token with a userId, using later for autheration
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: '1h',
    });
    console.log('User ID from token:', user._id);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
