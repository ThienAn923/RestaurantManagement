// RatingController.js
const RatingService = require('../services/rating.service');
const ApiError = require("../api-error");

class RatingController {
  async createRating(req, res, next) {
    try {
      const newRating = await RatingService.createRating(req.body);
      res.status(201).json(newRating);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }

  async getRatingsByDishId(req, res,next) {
    try {
      const Ratings = await RatingService.getRatingsByDishId(req.params.dishId);
      res.status(200).json(Ratings);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }
  async getAllRatings(req, res) {
    try {
      const ratings = await RatingService.getAllRatings();
      res.status(200).json(ratings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async getRatingById(req, res,next) {
    const { RatingId } = req.params;
    try {
      const Rating = await RatingService.getRatingById(RatingId);
      if (!Rating) {
        return res.status(404).json({ Rating: 'Tin nhắn không tìm thấy' });
      }
      res.status(200).json(Rating);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }

  async updateRating(req, res, next) {
    const { RatingId } = req.params;
    const RatingData = req.body;
    try {
      const updatedRating = await RatingService.updateRating(RatingId, RatingData);
      res.status(200).json(updatedRating);
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }

  async deleteRating(req, res, next) {
    const { RatingId } = req.params;
    try {
      await RatingService.deleteRating(RatingId);
      res.status(204).send(); // Xóa thành công, không trả về nội dung
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
  }
}

module.exports = new RatingController();
