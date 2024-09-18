const express = require("express");
const AccountController = require("../controllers/account.controller.js");
const router = express.Router();

router.route("/login")
    .post(AccountController.login)

module.exports = router;