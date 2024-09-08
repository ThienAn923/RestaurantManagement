const express = require("express");
const cors = require("cors");
const app = express();
const dishRouter = require('./app/route/dish.route');
const ApiError = require("./app/api-error");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Welcome to ThienAn Restaurant"});
});
app.get("/dish", (req, res) => {
    res.json({ message: "test"});
});

app.use("/api/dish", dishRouter);

app.use((err, req, res,next) =>{
    return res.status(error.statusCode || 500).json({
        message: error.message || "Internal Server Error",
    });
});

module.exports = app;