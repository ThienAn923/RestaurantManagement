const OrderDetailService = require("../services/orderDetail.service");
const ApiError = require("../api-error");

class OrderDetailController {
    async createOrderDetail(req, res,next) {
        try {
            const OrderDetail = await OrderDetailService.createOrderDetail(req.body);
            res.status(200).json(OrderDetail);
        } catch (error) {
            // return next(new ApiError(500, "An error occurred while creating OrderDetail"));
            return next(new ApiError(500, error.message));


        }
    }
    
    async getOrderDetailById(req, res, next) {
        try {
            const OrderDetail = await OrderDetailService.getOrderDetailById(req.params.id);
            if (!OrderDetail) {
                return res.status(404).json({ message: 'OrderDetail not found' });
            }
            res.status(200).json(OrderDetail);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving OrderDetail"));
        }
    }
    
    async getAllOrderDetails(req, res, next) {
        try {
            const OrderDetails = await OrderDetailService.getAllOrderDetails();
            res.status(200).json(OrderDetails);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }

    async updateOrderDetail(req, res, next) {
        try {
            const OrderDetail = await OrderDetailService.updateOrderDetail(req.params.id, req.body);
            if (!OrderDetail) {
                return res.status(404).json({ message: 'OrderDetail not found' });
            }
            res.status(200).json(OrderDetail);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while updating OrderDetail"));
        }
    }

    async deleteOrderDetail(req, res, next) {
        try {
            const OrderDetail = await OrderDetailService.deleteOrderDetail(req.params.id);
            if (!OrderDetail) {
                return res.status(404).json({ message: 'OrderDetail not found' });
            }
            res.status(200).json({ message: 'OrderDetail deleted successfully' });
        } catch (error) {
            return next(new ApiError(500, "An error occurred while deleting OrderDetail"));
        }
    }
}

module.exports = new OrderDetailController();