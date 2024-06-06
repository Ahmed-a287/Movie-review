const express = require('express');
const authToken = require('../middleware/authToken');
const router = express.Router();
const Review = require('../models/Review');

// Protecet all routes with authToken
router.use('/reviews', authToken);

// Create a review
router.post('/reviews', async (req, res) => {
  try {
    const review = new Review({
      ...req.body,
      userId: req.user.userId,
    });

    await review.save();

    // Adding the movie title and user name for the created review
    const populatedReview = await Review.findById(review._id)
      .populate('movieId', 'title')
      .populate('userId', 'username');

    // Exclude updatedAt from the response
    const { updatedAt, ...reviewWithoutUpdatedAt } = populatedReview.toObject();

    res.status(201).json({
      message: 'Your review has been successfully added',
      review: reviewWithoutUpdatedAt,
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to add review', error });
  }
});
// Get all the reviews
router.get('/reviews', authToken, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('movieId', 'title')
      .populate('userId', 'username');

    res.status(200).json(reviews);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to get reviews', error: error.message });
  }
});

// Get a review by ID
router.get('/reviews/:id', async (req, res) => {
  const reviewId = req.params.id;

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to get review', error: error.message });
  }
});

// Update a review (by ID)
router.put('/reviews/:id', async (req, res) => {
  const reviewId = req.params.id; //Extracts reviewId
  const userId = req.user.userId; //Extracts userId

  const { title, content, rating } = req.body; //Review data from req.body

  try {
    // Get the review from database
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the logged in user is the right user (creator)
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        message: 'Unauthorized - You are not the creator of this review',
      });
    }

    // The updated Review info with data from req.body
    review.title = title;
    review.content = content;
    review.rating = rating;
    review.updatedAt = Date.now();
    await review.save();

    res.json({ message: 'Review updated successfully', review });
  } catch (error) {
    console.error('Error updating review:', error);
    res
      .status(500)
      .json({ message: 'Failed to update review', error: error.message });
  }
});

// Delete a review
router.delete('/reviews/:id', async (req, res) => {
  const reviewId = req.params.id;
  const userId = req.user.userId;
  try {
    // Finde the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the logged in user is the right user (creator)
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        message: 'Unauthorized - You are not the creator of this review',
      });
    }

    await Review.deleteOne({ _id: reviewId });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res
      .status(500)
      .json({ message: 'Failed to delete review', error: error.message });
  }
});

module.exports = router;
