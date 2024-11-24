const express = require("express");
const MessageController = require("../controllers/messageChat.controller");

const router = express.Router();

router.route("/")
    .post(MessageController.createMessage)
    .get(MessageController.getAllMessages);
    
router.route("/room/:roomId")
    .get(MessageController.getMessagesByRoomId);

router.route("/:id")
    .get(MessageController.getMessageById)
    .put(MessageController.updateMessage)
    .delete(MessageController.deleteMessage);

module.exports = router;
