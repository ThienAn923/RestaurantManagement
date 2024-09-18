const promotionService = require('../services/promotion.service');
const promotionAfterDishService = require('../services/promotionAfterDish.service');
const promotionAfterInvoiceService = require('../services/promotionAfterInvoice.service');
const ApiError = require("../api-error");

class PromotionController{
    async createPromotion(type, data) {
        try {
            if(type === 'afterDish'){
                const promotion = await promotionAfterDishService.createPromotionAfterDish(data);
                return promotion;
            }
            else if(type === 'afterInvoice'){
                const promotion = await promotionAfterInvoiceService.createPromotionAfterInvoice(data);
                return promotion;
            }
        } catch (error) {
            throw new ApiError(500, "An error occurred while creating promotion");
        }
    }

    async getPromotionById(req, res, next) {
        try {
            const promotionId = req.params.id;
            const promotion = await promotionService.getPromotionById(promotionId);

            if (!promotion) {
                return res.status(404).json({ message: 'Promotion not found' });
            }

            const promotionAfterInvoice = await prisma.promotionAfterInvoice.findUnique({
                where: { promotionID: promotionId }
            });

            const promotionAfterDish = await prisma.promotionAfterDish.findUnique({
                where: { promotionID: promotionId }
            });
            
            // Determine the type of promotion
            //This part is suck, I know. But I can't think of a better way to do it
            //This will first
            const promotionType = promotionAfterInvoice ? { type: 'invoice', details: promotionAfterInvoice } : 
                                  promotionAfterDish ? { type: 'dish', details: promotionAfterDish } : 
                                  null;

            res.status(200).json({ promotion, promotionType });
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving promotion"));
        }
    }

    async getAllPromotions(req, res, next) {
        try {
            const promotions = await promotionService.getAllPromotions();

            const promotionsWithTypes = await Promise.all(promotions.map(async (promotion) => {
                const promotionAfterInvoice = await prisma.promotionAfterInvoice.findUnique({
                    where: { promotionID: promotion.id }
                });

                const promotionAfterDish = await prisma.promotionAfterDish.findUnique({
                    where: { promotionID: promotion.id }
                });

                const promotionType = promotionAfterInvoice ? { type: 'invoice', details: promotionAfterInvoice } : 
                                      promotionAfterDish ? { type: 'dish', details: promotionAfterDish } : 
                                      null;

                return {...promotion, promotionType };
            }));

            res.status(200).json(promotionsWithTypes);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving promotions"));
        }
    }

    async updatePromotion(req, res, next) {
        try {
            const promotionId = req.params.id;
            const promotion = await promotionService.updatePromotion(promotionId, req.body);

            if (!promotion) {
                return res.status(404).json({ message: 'Promotion not found' });
            }

            const promotionAfterInvoice = await prisma.promotionAfterInvoice.findUnique({
                where: { promotionID: promotionId }
            });

            const promotionAfterDish = await prisma.promotionAfterDish.findUnique({
                where: { promotionID: promotionId }
            });

            //im assuming req.body contain the exact data for promotionAfterInvoice or promotionAfterDish
            //because if they've choose to update promotion, the app would know what type of promotion it is to pass the correct data
            if(promotionAfterInvoice){
                await promotionAfterInvoiceService.updatePromotionAfterInvoice(promotionAfterInvoice.id, req.body);
            }
            else if(promotionAfterDish){
                await promotionAfterDishService.updatePromotionAfterDish(promotionAfterDish.id, req.body);
            }
            res.status(200).json({ promotion, promotionType });
        } catch (error) {
            return next(new ApiError(500, "An error occurred while updating promotion"));
        }
    }

    async deletePromotion(req, res, next) {
        try {
            const promotionId = req.params.id;
            const promotion = await promotionService.deletePromotion(promotionId);

            if (!promotion) {
                return res.status(404).json({ message: 'Promotion not found' });
            }

            const promotionAfterInvoice = await prisma.promotionAfterInvoice.findUnique({
                where: { promotionID: promotionId }
            });

            const promotionAfterDish = await prisma.promotionAfterDish.findUnique({
                where: { promotionID: promotionId }
            });

            if(promotionAfterInvoice){
                await promotionAfterInvoiceService.deletePromotionAfterInvoice(promotionAfterInvoice.id);
            }
            else if(promotionAfterDish){
                await promotionAfterDishService.deletePromotionAfterDish(promotionAfterDish.id);
            }

            res.status(200).json({ message: 'Promotion deleted successfully' });
        } catch (error) {
            return next(new ApiError(500, "An error occurred while deleting promotion"));
        }
    }
}

module.exports = new PromotionController();