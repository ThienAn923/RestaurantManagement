const orderService = require('../services/order.service');
const ApiError = require("../api-error");

class OrderController {
    async createOrder(req, res, next) {

        try {
          const order = await orderService.createOrder(req.body);
          res.status(201).json(order);
        } catch (error) {
          console.log('Error detected:', error);
      
          return next(new ApiError(500, error.message));
        }
      }
    async getOrderById(req, res, next) {
        try {
            const order = await orderService.getOrderById(req.params.id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.status(200).json(order);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving order"));
        }
    }
    
    async getAllOrders(req, res, next) {
        try {
            const orders = await orderService.getAllOrders();
            res.status(200).json(orders);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving orders"));
        }
    }

    async updateOrder(req, res, next) {
        try {
            const order = await orderService.updateOrder(req.params.id, req.body);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.status(200).json(order);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while updating order"));
        }
    }

    async deleteOrder(req, res, next) {
        try {
            const order = await orderService.deleteOrder(req.params.id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.status(200).json({ message: 'Order deleted successfully' });
        } catch (error) {
            return next(new ApiError(500, "An error occurred while deleting order"));
        }
    }
}

module.exports = new OrderController();