const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const authToken = require('./src/middleware/authToken');
const authRoutes = require('./src/routes/auth');
const movieRoutes = require('./src/routes/Movies');
const reviewRoutes = require('./src/routes/Reviews');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Conect to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to database successfully');
  } catch (error) {
    console.error('Failed to connect to database', error);
    if (error.message.includes('bad auth') || error.code === 8000) {
      console.error(
        'Authentication failed: Check your username and/or password'
      );
    }
  }
};
connectToDatabase();

// Routes
//Protecet all the route with authToken
app.use('/api/auth', authRoutes);
app.use('/api', authToken, movieRoutes);
app.use('/api', authToken, reviewRoutes);
//Just a welcome page
app.get('/', (req, res) => {
  res.send('Welcome to Movie Reviews API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
