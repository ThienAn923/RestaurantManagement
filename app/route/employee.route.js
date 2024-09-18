const express = require("express");
const EmployeeController = require("../controllers/employee.controller.js");


const router = express.Router();

router.route("/")
    .get(EmployeeController.getAllEmployees)
    .post(EmployeeController.createEmployee)

router.route("/:id")
    .get(EmployeeController.getEmployeeById)
    .put(EmployeeController.updateEmployee)
    .delete(EmployeeController.deleteEmployee);

module.exports = router;