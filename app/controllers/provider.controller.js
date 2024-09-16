const providerService = require('../services/provider.service');
const ApiError = require("../api-error");

class ProviderController {
    async createProvider(data) {
        try {
            const provider = await providerService.createProvider(data);
            return provider;
        } catch (error) {
            throw new ApiError(500, "An error occurred while creating provider");
        }
    }
    
    async getProviderById(req, res, next) {
        try {
            const provider = await providerService.getProviderById(req.params.id);
            if (!provider) {
                return res.status(404).json({ message: 'Provider not found' });
            }
            res.status(200).json(provider);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving provider"));
        }
    }
    
    async getAllProviders(req, res, next) {
        try {
            const providers = await providerService.getAllProviders();
            res.status(200).json(providers);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving providers"));
        }
    }

    async updateProvider(req, res, next) {
        try {
            const provider = await providerService.updateProvider(req.params.id, req.body);
            if (!provider) {
                return res.status(404).json({ message: 'Provider not found' });
            }
            res.status(200).json(provider);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while updating provider"));
        }
    }

    async deleteProvider(req, res, next) {
        try {
            const provider = await providerService.deleteProvider(req.params.id);
            if (!provider) {
                return res.status(404).json({ message: 'Provider not found' });
            }
            res.status(200).json({ message: 'Provider deleted successfully' });
        } catch (error) {
            return next(new ApiError(500, "An error occurred while deleting provider"));
        }
    }
}