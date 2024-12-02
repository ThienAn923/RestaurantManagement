const express = require("express");
const RoomChatController = require("../controllers/roomChat.controller");
const MessageChatController = require("../controllers/messageChat.controller");

const router = express.Router();

router
  .route("/")
  .get(RoomChatController.getAllRooms)
  .post(RoomChatController.createRoom);

router
  .route("/:roomId")
  .get(RoomChatController.getRoomById)
  .put(RoomChatController.updateRoom)
  .delete(RoomChatController.deleteRoom);
router.route("/client/:clientID").get(RoomChatController.getRoomByClientID);
router
  .route("/messages/:id")
  .get(MessageChatController.getMessagesByRoomId)
  .post(MessageChatController.createMessage);

module.exports = router;
