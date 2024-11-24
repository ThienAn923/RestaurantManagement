import express from "express";
import QRController from "../controllers/qr.controller.js";

const router = express.Router();

router.route("/")
    .post(QRController.createQrCode)
    .get(QRController.getAllQrCodes);
router.route("/:id")
    .get(QRController.getQrCodeById);

module.exports = router;;