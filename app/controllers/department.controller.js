const departmentService = require('../services/department.service');
const ApiError = require("../api-error");

class DepartmentController {
    async createDepartment(req, res, next) {
        if (!req.body?.departmentName) {
            return next(new ApiError(400, "Department Name must be filled"));
        }
        try {
            const department = await departmentService.createDepartment(req.body);
            res.status(201).json(department);
        } catch (error) {
            console.log('Error detected:', error);
            return next(new ApiError(500, error.message));
        }
    }

    async getDepartmentById(req, res, next) {
        try {
            const department = await departmentService.getDepartmentById(req.params.id);
            if (!department) {
                return res.status(404).json({ message: 'Department not found' });
            }
            res.status(200).json(department);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving department"));
        }
    }

    async getAllDepartments(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const departments = await departmentService.getAllDepartments(page, limit, req.query.sortColumn, req.query.sortOrder);
            res.status(200).json(departments);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }

    async updateDepartment(req, res, next) {
        try {
            const updatedDepartment = await departmentService.updateDepartment(req.params.id, req.body);
            res.status(200).json(updatedDepartment);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while updating department"));
        }
    }

    async deleteDepartment(req, res, next) {
        try {
            await departmentService.deleteDepartment(req.params.id);
            res.status(204).json();
        } catch (error) {
            return next(new ApiError(500, "An error occurred while deleting department"));
        }
    }
}

module.exports = new DepartmentController();