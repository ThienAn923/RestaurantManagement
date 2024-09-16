const express = require("express");
const AccountController = require("../controllers/account.controller.js");
const { route } = require("../../app.js");

const router = express.Router();

router.route("/")
    .get(AccountController.getAllAccounts)
    .post(AccountController.createAccount)

router.route("/:id")
    .get(AccountController.getAccountById)
    .put(AccountController.updateAccount)
    .delete(AccountController.deleteAccount);