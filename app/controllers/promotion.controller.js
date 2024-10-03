const promotionService = require('../services/promotion.service');
const promotionAfterDishService = require('../services/promotionAfterDish.service');
const promotionAfterInvoiceService = require('../services/promotionAfterInvoice.service');
const ApiError = require("../api-error");

//WHY IS THIS HERE? THIS SHOULD BE IN THE SERVICE
//WHO THE FUCK MERGE SERVICE AND CONTROLLER TO THIS FILE
//Now i gotta repair this. which took ALOT of time
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PromotionController{
    // async createPromotion( req, res, next) {
    //     try {
    //         console.log(JSON.stringify(req.body))
    //         const promotion = await promotionAfterInvoiceService.createPromotionAfterInvoice(req.body);
    //             res.status(201).json(promotion);
    //             return promotion;
    //         // if(type === 'afterDish'){

    //         // }
    //         // else if(type === 'afterInvoice'){
    //         //     const promotion = await promotionAfterInvoiceService.createPromotionAfterInvoice(req.body);
    //         //     res.status(201).json(promotion);
    //         //     return promotion;
    //         // }
    //     } catch (error) {
    //         console.log('Error detected:', error);

    // return next(new ApiError(500, "An error occurred while creating dish"));
    //     }
    // }

    async createPromotion(req, res, next) {
        try {
            const { promotionType, dishes, minimumSpend, promotionLimit, ...promotionData } = req.body;

            const promotion = await prisma.promotion.create({
                data: promotionData
            });

            if (promotionType === 'invoice') {
                await prisma.PromotionAfterInvoice.create({
                    data: {
                        promotionID: promotion.id,
                        minimumSpend,
                        promotionLimit
                    }
                });
            } else if (promotionType === 'dish') {
                const promotionAfterDish = await prisma.PromotionAfterDish.create({
                    data: {
                        promotionID: promotion.id
                    }
                });

                await prisma.dish.updateMany({
                    where: { id: { in: dishes } },
                    data: {
                        promotionAfterDishId: promotionAfterDish.id
                    }
                });
            } else {
                throw new Error('Invalid promotion type');
            }

            res.status(201).json(promotion);
        } catch (error) {
            console.log('Error detected:', error);
            return next(new ApiError(500, "An error occurred while creating promotion"));
        }
    }

    async getPromotionById(req, res, next) {
        try {
            const promotionId = req.params.id;
            const promotion = await promotionService.getPromotionById(promotionId);

            if (!promotion) {
                return res.status(404).json({ message: 'Promotion not found' });
            }

            const promotionAfterInvoice = await prisma.PromotionAfterInvoice.findUnique({
                where: { promotionID: promotionId }
            });

            const promotionAfterDish = await prisma.PromotionAfterDish.findUnique({
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

    // async getAllPromotions(req, res, next) {
    //     try {
            
    //         const promotions = await promotionService.getAllPromotions();
    //         const promotionsWithTypes = await Promise.all(promotions.map(async (promotion) => {

    //             //I am TERAIBLY sorry for the findFirst part because even though
    //             //in prisma model, promotionID is unique, i still got error when i use findUnique
    //             //Which is weird, like.. WEIRD weird, because i use it literallt every where else, but only this one got error
    //             //It should work fine if there is no multiple promotion with the same ID, which is kinda impossible
    //             const promotionAfterInvoice = await prisma.PromotionAfterInvoice.findFirst({
    //                 where: { promotionID: promotion.id }
    //             })
    //             // console.log(JSON.stringify(promotionAfterInvoice))

    //             const promotionAfterDish = await prisma.PromotionAfterDish.findFirst({
    //                 where: { promotionID: promotion.id }
    //             })

    //             const promotionType = promotionAfterInvoice ? { type: 'invoice', details: promotionAfterInvoice } : 
    //                                   promotionAfterDish ? { type: 'dish', details: promotionAfterDish } : 
    //                                   null;
    //             // Debug
    //             // console.log(JSON.stringify(promotionType))

    //             //For debug, I want to see the promotion with the type because it keep return null somehow
    //             // console.log(promotion)
    //             // console.log(promotionType)
    //             const promotionWithType = { ...promotion, promotionType };
    //             // console.log(JSON.stringify(promotionWithType))
    //             return promotionWithType;

    //             // return {...promotion, promotionType };
    //         }));
    //         // console.log(JSON.stringify(promotionsWithTypes))
    //         res.status(200).json(promotionsWithTypes);
    //     } catch (error) {
    //         return next(new ApiError(500, error.message));
    //     }
    // }
    
    async getAllPromotions(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sortColumn = req.query.sortColumn || 'promotionName';
            const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
            const skip = (page - 1) * limit;

            const [promotions, totalCount] = await Promise.all([
                prisma.promotion.findMany({
                    skip,
                    take: limit,
                    orderBy: { [sortColumn]: sortOrder },
                    where: { isDeleted: false },
                    include: {
                        PromotionAfterDish: true,
                        PromotionAfterInvoice: true
                    }
                }),
                prisma.promotion.count({ where: { isDeleted: false } })
            ]);

            const promotionsWithTypes = promotions.map(promotion => {
                const promotionType = promotion.PromotionAfterInvoice.length > 0 
                    ? { type: 'invoice', details: promotion.PromotionAfterInvoice[0] }
                    : promotion.PromotionAfterDish.length > 0
                    ? { type: 'dish', details: promotion.PromotionAfterDish[0] }
                    : null;

                return {
                    ...promotion,
                    promotionType,
                    PromotionAfterDish: undefined,
                    PromotionAfterInvoice: undefined
                };
            });

            res.status(200).json({
                promotions: promotionsWithTypes,
                total: totalCount,
                page,
                limit
            });
        } catch (error) {
            return next(new ApiError(500, error.message));
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