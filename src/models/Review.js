const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  movieId: {
    //Getting movieId "ObjectId" from Movie schema
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  //Getting userId "ObjectId" from User schema
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Review', ReviewSchema);
