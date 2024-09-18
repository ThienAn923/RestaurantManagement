const express = require("express");
const AccountController = require("../controllers/account.controller.js");


const router = express.Router();

router.route("/")
    .get(AccountController.getAllAccounts)
    .post(AccountController.createAccount)

router.route("/:id")
    .get(AccountController.getAccountById)
    .put(AccountController.updateAccount)
    .delete(AccountController.deleteAccount);

router.route("/login")
    .post(AccountController.login)

module.exports = router;