const invoiceService = require("../services/invoice.service");
const ApiError = require("../api-error");

class InvoiceController {
  async createInvoice(req, res, next) {
    try {
      console.log(req.body);
      const invoice = await invoiceService.createInvoice(req.body);
      res.status(201).json(invoice);
    } catch (error) {
      throw new ApiError(500, error.message);
    }
  }

  async getInvoiceById(req, res, next) {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.status(200).json(invoice);
    } catch (error) {
      return next(
        new ApiError(500, "An error occurred while retrieving invoice")
      );
    }
  }

  async getAllInvoices(req, res, next) {
    try {
      req.query.page = parseInt(req.query.page);
      req.query.limit = parseInt(req.query.limit);
      const invoices = await invoiceService.getAllInvoices(
        req.query.page,
        req.query.limit
      );
      // const lalala = await invoiceService.createInvoicesForAllOrders();
      res.status(200).json(invoices);
    } catch (error) {
      return next(new ApiError(500, error.message));
    }
  }

  async getTotalIncome(req, res, next) {
    try {
      const totalIncome = await invoiceService.getTotalIncome();
      res.status(200).json(totalIncome);
    } catch (error) {
      return next(new ApiError(500, error.message));
    }
  }

  async getRecentInvoice(req, res, next) {
    try {
      const recentInvoice = await invoiceService.getRecentInvoice();
      res.status(200).json(recentInvoice);
    } catch (error) {
      return next(new ApiError(500, error.message));
    }
  }

  async getTopDish(req, res, next) {
    try {
      const topDish = await invoiceService.getTopDish();
      res.status(200).json(topDish);
    } catch (error) {
      return next(new ApiError(500, error.message));
    }
  }

  async getIncomeData(req, res, next) {
    try {
      const incomeData = await invoiceService.getIncomeData();
      res.status(200).json(incomeData);
    } catch (error) {
      return next(new ApiError(500, error.message));
    }
  }

  async getCustomIncomeData(req, res, next) {
    try {
      const incomeData = await invoiceService.customGetIncomeData(
        req.query.startDate,
        req.query.endDate,
        req.query.step
      );
      res.status(200).json(incomeData);
    } catch (error) {
      return next(new ApiError(500, error.message));
    }
  }

  async getAllInvoicesHaveClientID(req, res, next) {
    try {
      const invoices = await invoiceService.getAllInvoicesHaveClientID();
      res.status(200).json(invoices);
    } catch (error) {
      return next(new ApiError(500, error.message));
    }
  }
}

module.exports = new InvoiceController();
