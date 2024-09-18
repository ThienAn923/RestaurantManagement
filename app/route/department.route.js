const express = require("express");
const DepartmentController = require("../controllers/department.controller.js");


const router = express.Router();

router.route("/")
    .get(DepartmentController.getAllDepartments)
    .post(DepartmentController.createDepartment)

router.route("/:id")
    .get(DepartmentController.getDepartmentById)
    .put(DepartmentController.updateDepartment)
    .delete(DepartmentController.deleteDepartment);

module.exports = router;