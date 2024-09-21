const accountService = require('../services/account.service');
const ApiError = require("../api-error");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AccountController {
    async createAccount(req, res, next) {
        if(!req.body?.accountUsername || !req.body?.accountAuthority || !req.body?.accountPassword){
            return next(new ApiError(400, "All fields must be filled including accountUsername, accountAuthority, and accountPassword"));
        }
        try{
            const account = await accountService.createAccount(req.body);
            res.status(201).json(account);
        }catch(error){
            console.log('Error detected:', error);
            return next(new ApiError(500, "An error occurred while creating account"));
        }
    }

    async getAccountById(req, res, next) {
        try{
            const account = await accountService.getAccountById(req.params.id);
            if(!account){
                return res.status(404).json({message: 'Account not found'});
            }
            res.status(200).json(account);
        }catch(error){
            return next(new ApiError(500, "An error occurred while retrieving account"));
        }
    }

    async getAllAccounts(req, res, next) {
        try{
            const accounts = await accountService.getAllAccounts();
            res.status(200).json(accounts);
        }catch(error){
            return next(new ApiError(500, error.message));
        }
    }

    async updateAccount(req, res, next) {
        try{
            const updatedAccount = await accountService.updateAccount(req.params.id, req.body);
            res.status(200).json(updatedAccount);
        }catch(error){
            return next(new ApiError(500, "An error occurred while updating account"));
        }
    }

    async deleteAccount(req, res, next) {
        try{
            await accountService.deleteAccount(req.params.id);
            res.status(204).json();
        }catch(error){
            return next(new ApiError(500, "An error occurred while deleting account"));
        }
    }


    //temporary login function, will move part of this to service later (later mean never :D if i never come back to this file)
    async login(req, res, next) {
        const { accountUsername, accountPassword } = req.body;
        if (!accountUsername || !accountPassword) {
            return next(new ApiError(400, "Both username and password are required"));
        }

        try {
            const account = await accountService.getAccountByUsername(accountUsername);
            if (!account) {
                return next(new ApiError(401, "Invalid username or password"));
            }

            // const isPasswordValid = await bcrypt.compare(accountPassword, account.password);
            const isPasswordValid = accountPassword === account.accountPassword;
            if (!isPasswordValid) {
                return next(new ApiError(401, "Invalid username or password"));
            }

            //too complicated, will use temporary token for now (im still learning T.T)
            // const token = jwt.sign({ id: account.id }, process.env.JWT_SECRET, { expiresIn: '10m' });
            const token = 'temporary';
            res.status(200).json({ token });
        } catch (error) {
            console.error('Error detected:', error);
            return next(new ApiError(500, error.message));
        }
    }
}

module.exports = new AccountController();