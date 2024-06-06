const express = require('express');
const authToken = require('../middleware/authToken');
const router = express.Router();
const Movie = require('../models/Movie');

// Protect all routes with authToken
router.use('/movies', authToken);

// Create a movie
router.post('/movies', async (req, res) => {
  try {
    //Creating a movie connected to a userId
    const movie = new Movie({
      ...req.body,
      userId: req.user.userId,
    });
    await movie.save();
    res
      .status(201)
      .json({ message: 'Your movie has been successfully added', movie });
  } catch (error) {
    res.status(400).json({ message: 'Failed to add movie', error });
  }
});

// Get all the movies from database
router.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find().populate('userId', 'username');
    res.status(200).json(movies);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to get movies', error: error.message });
  }
});

// Get a movie by ID
router.get('/movies/:id', async (req, res) => {
  const movieId = req.params.id;

  try {
    const movie = await Movie.findById(movieId).populate('userId', 'username');

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(200).json(movie);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to get movie', error: error.message });
  }
});

// Update a movie (by ID)
router.put('/movies/:id', async (req, res) => {
  const movieId = req.params.id; //Extracts movieId
  const userId = req.user.userId; //Extracts userId
  const { title, director, releaseYear, genre } = req.body; //Movie data from req.body

  try {
    // Finde the movie
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if the logged in user is the right user (creator)
    if (movie.userId.toString() !== userId) {
      return res.status(403).json({
        message: 'Unauthorized - You are not the creator of this movie',
      });
    }

    // The updated movie info with data from req.body
    movie.title = title;
    movie.director = director;
    movie.releaseYear = releaseYear;
    movie.genre = genre;
    await movie.save();

    res.json({ message: 'Movie updated successfully', movie });
  } catch (error) {
    console.error('Error updating movie:', error);
    res
      .status(500)
      .json({ message: 'Failed to update movie', error: error.message });
  }
});

// Delete a movie (by ID)
router.delete('/movies/:id', async (req, res) => {
  const movieId = req.params.id;
  const userId = req.user.userId;
  try {
    // finde the movie
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if the logged in user is the right user (creator)
    if (movie.userId.toString() !== userId) {
      return res.status(403).json({
        message: 'Unauthorized - You are not the creator of this movie',
      });
    }

    await Movie.deleteOne({ _id: movieId });
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res
      .status(500)
      .json({ message: 'Failed to delete movie', error: error.message });
  }
});

module.exports = router;
