    const express = require("express");
    const CommentController = require("../controllers/comment.controller");

    const router = express.Router();

    router.route("/")
        .post(CommentController.createComment)
        .get(CommentController.getAllComments);
        
    router.route("/dish/:dishId")
        .get(CommentController.getCommentsByDishId);

    router.route("/:id")
        .get(CommentController.getCommentById)
        .put(CommentController.updateComment)
        .delete(CommentController.deleteComment);

    module.exports = router;
