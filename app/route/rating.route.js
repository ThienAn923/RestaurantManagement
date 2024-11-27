const express = require("express");
const RatingController = require("../controllers/rating.controller");

const router = express.Router();

// Route cho việc tạo đánh giá mới
router.route("/")
    .post(RatingController.createRating)
    .get(RatingController.getAllRatings);
// Route cho việc lấy danh sách đánh giá theo dishId
router.route("/dish/:dishId")
    .get(RatingController.getRatingsByDishId);

// Route cho các thao tác với đánh giá dựa trên id
router.route("/:id")
    .get(RatingController.getRatingById)
    .put(RatingController.updateRating)
    .delete(RatingController.deleteRating);

module.exports = router;
