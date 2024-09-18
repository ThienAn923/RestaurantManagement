const clientService = require('../services/client.service');
const ApiError = require("../api-error");

class ClientController {
    async createClient(req, res, next) {
        if (!req.body?.name) {
            return next(new ApiError(400, "Name must be filled"));
        }

        try {
            const client = await clientService.createClient(req.body);
            res.status(201).json(client);
        } catch (error) {
            console.log('Error detected:', error);
            return next(new ApiError(500, "An error occurred while creating client"));
        }
    }
    
    async getClientById(req, res, next) {
        try {
            const client = await clientService.getClientById(req.params.id);
            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }
            res.status(200).json(client);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving client"));
        }
    }
    
    async getAllClients(req, res, next) {
        try {
            const clients = await clientService.getAllClients();
            res.status(200).json(clients);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving clients"));
        }
    }
    
    async updateClient(req, res, next) {
        try {
            const updatedClient = await clientService.updateClient(req.params.id, req.body);
            res.status(200).json(updatedClient);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while updating client"));
        }
    }
    
    async deleteClient(req, res, next) {
        try {
            await clientService.deleteClient(req.params.id);
            res.status(204).json();
        } catch (error) {
            return next(new ApiError(500, "An error occurred while deleting client"));
        }
    }
}

module.exports = new ClientController();
