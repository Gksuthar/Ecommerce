import Review from '../models/reviewModal.js'

export const createReview = async (req, res) => {
  const { productId, comment, rating } = req.body;
  const userId = req.userId;

  if (!productId || !comment || !rating) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const review = new Review({
      productId,
      userId,
      comment,
      rating
    });

    await review.save();
    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ error: "Failed to submit review" });
  }
};

export const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ productId }).populate('userId', 'name');
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};
