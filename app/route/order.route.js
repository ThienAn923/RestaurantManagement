const express = require("express");
const OrderController = require("../controllers/order.controller.js");

const router = express.Router();

router.route("/")
    .get(OrderController.getAllOrders)
    .post(OrderController.createOrder)

router.route("/:id")
    .get(OrderController.getOrderById)
    .put(OrderController.updateOrder)
    .delete(OrderController.deleteOrder);

module.exports = router;