const clientService = require("../services/client.service");
const ApiError = require("../api-error");
const emailQueue = require("../services/emailQueue.service");
const session = require("express-session");
const prisma = require("../../prisma/client");
class ClientController {
  async createClient(req, res, next) {
    if (!req.body?.name) {
      return next(new ApiError(400, "Name must be filled"));
    }

    try {
      req.body.tokenExpiresAt = new Date().toISOString();
      req.body.verificationToken = "";
      const client = await clientService.createClient(req.body);
      res.status(201).json(client);
    } catch (error) {
      console.log("Error detected:", error);
      return next(new ApiError(500, error.message));
    }
  }
  async verifyOtp(req, res, next) {
    const { otp } = req.body;
    const email = req.session.email;
    console.log(`otp gui di ${otp}`);
    console.log(`email check ${email}`);
    if (!otp) {
      return next(new ApiError(400, "OTP must be provided"));
    }
    try {
      const account = await prisma.account.findFirst({
        where: {
          tokenExpiresAt: { gt: new Date() },
          verificationToken: otp.toString(),
        },
      });

      // Kiểm tra nếu không tìm thấy người dùng
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      // Kiểm tra nếu OTP đã được xác minh trước đó
      if (account.isVerified) {
        return res.status(400).json({ message: "Email is already verified." });
      }

      // Cập nhật trường `isVerified` của người dùng thành true
      await prisma.account.update({
        where: {
          id: account.id,
        },
        data: {
          isVerified: true,
        },
      });

      // Xóa OTP khỏi session sau khi xác minh thành công
      req.session.otp = null;
      req.session.otpExpiresAt = null;

      // Trả về thông báo thành công
      res.status(200).json({ message: "Email verified successfully." });
    } catch (error) {
      console.log("Error during OTP verification:", error);
      return next(
        new ApiError(500, "An error occurred during email verification")
      );
    }
  }

  async getClientById(req, res, next) {
    try {
      const client = await clientService.getClientById(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(200).json(client);
    } catch (error) {
      return next(
        new ApiError(500, "An error occurred while retrieving client")
      );
    }
  }

  async getAllClients(req, res, next) {
    try {
      let { page, limit, ...rest } = req.query;
      const { sortCollumn, sortOrder, search } = rest;
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 5;

      const clients = await clientService.getAllClients(
        page,
        limit,
        sortCollumn,
        sortOrder,
        search
      );
      res.status(200).json(clients);
    } catch (error) {
      return next(new ApiError(500, error.message));
    }
  }

  async updateClient(req, res, next) {
    try {
      const otp = Math.floor(100000 + Math.random() * 90000).toString();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
      req.session.otp = otp;
      console.log(`otp luu vao ${req.session.otp}`);
      req.session.otpExpiresAt = otpExpiresAt;
      req.session.email = req.body.email;
      req.body.tokenExpiresAt = otpExpiresAt;
      req.body.verificationToken = otp;
      await emailQueue.add({
        to: req.body.email,
        subject: "Xác minh email",
        html: `<p>Mã  xác minh của bạn là: <strong>${otp}</strong></p>`,
      });
      const updatedClient = await clientService.updateClient(
        req.params.id,
        req.body
      );
      res.status(200).json(updatedClient);
    } catch (error) {
      return next(new ApiError(500, error.message));
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
