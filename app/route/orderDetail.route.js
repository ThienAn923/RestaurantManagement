const express = require("express");
const OrderDetailController = require("../controllers/orderDetail.controller");

const router = express.Router();

router.route("/")
    .get(OrderDetailController.getAllOrderDetails)
    .post(OrderDetailController.createOrderDetail)

router.route("/:id")
    .get(OrderDetailController.getOrderDetailById)
    .put(OrderDetailController.updateOrderDetail)
    .delete(OrderDetailController.deleteOrderDetail);

module.exports = router;