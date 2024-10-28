const express = require("express");
const AccountController = require("../controllers/account.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");

const router = express.Router();
//if you ever want to get createAccount to be public, just copy it below this line
router.post("/login", AccountController.login);

router.use(authMiddleware);
router.get("/me", AccountController.getCurrentUser);

router.route("/")
    .get(AccountController.getAllAccounts)
    .post(AccountController.createAccount)

router.route("/:id")
    .get(AccountController.getAccountById)
    .put(AccountController.updateAccount)
    .delete(AccountController.deleteAccount);

// router.route("/login")
//     .post(AccountController.login)
//     console.log("route: login");

module.exports = router;