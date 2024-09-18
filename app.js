const express = require("express");
const cors = require("cors");
const app = express();
const dishRouter = require('./app/route/dish.route');
const dishTypeRouter = require('./app/route/dishType.route');
const accountRouter = require('./app/route/account.route');
const clientRouter = require('./app/route/client.route');
const departmentRouter = require('./app/route/department.route');
const employeeRouter = require('./app/route/employee.route');
const importInvoiceRouter = require('./app/route/importInvoice.route');
const ingredientRouter = require('./app/route/ingredient.route');
const invoiceRouter = require('./app/route/invoice.route');
const orderRouter = require('./app/route/order.route');
const ingredientTypeRouter = require('./app/route/ingredientType.route');
const positionRouter = require('./app/route/position.route');
const promotionRouter = require('./app/route/promotion.route');
const tableRouter = require('./app/route/table.route');
const login = require('./app/route/login.route');

const ApiError = require("./app/api-error");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Welcome to ThienAn Restaurant"});
});
app.get("/dish", (req, res) => {
    res.json({ message: "test"});
});

app.use("/login", login)

app.use("/api/dish", dishRouter);

app.use("/api/DishType", dishTypeRouter);

app.use("/api/account", accountRouter);

app.use("/api/client", clientRouter);

app.use("/api/department", departmentRouter);

app.use("/api/employee", employeeRouter);

app.use("/api/importInvoice", importInvoiceRouter);

app.use("/api/ingredient", ingredientRouter);

app.use("/api/invoice", invoiceRouter);

app.use("/api/order", orderRouter);

app.use("/api/ingredientType", ingredientTypeRouter);

app.use("/api/position", positionRouter);

app.use("/api/promotion", promotionRouter);

app.use("/api/table", tableRouter);



app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
    });
});



module.exports = app;