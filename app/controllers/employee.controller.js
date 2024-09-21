const employeeService = require('../services/employee.service');
const ApiError = require("../api-error");

class EmployeeController {
    async createEmployee(req, res, next) {
        if (!req.body?.name || !req.body?.employeeAddress || !req.body?.employeeGender || !req.body?.employeeDateOfBirth || !req.body?.positionId || !req.body?.departmentId) {
            return next(new ApiError(400, "All fields must be filled"));
        }

        try {
            const employee = await employeeService.createEmployee(req.body);
            res.status(201).json(employee);
        } catch (error) {
            console.log('Error detected:', error);
            return next(new ApiError(500, "An error occurred while creating employee"));
        }
    }
    
    async getEmployeeById(req, res, next) {
        try {
            const employee = await employeeService.getEmployeeById(req.params.id);
            if (!employee) {
                return res.status(404).json({ message: 'Employee not found' });
            }
            res.status(200).json(employee);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while retrieving employee"));
        }
    }
    
    async getAllEmployees(req, res, next) {
        try {
            const employees = await employeeService.getAllEmployees();
            res.status(200).json(employees);
        } catch (error) {
            return next(new ApiError(500, error.message));
        }
    }
    
    async updateEmployee(req, res, next) {
        try {
            const updatedEmployee = await employeeService.updateEmployee(req.params.id, req.body);
            res.status(200).json(updatedEmployee);
        } catch (error) {
            return next(new ApiError(500, "An error occurred while updating employee"));
        }
    }
    
    async deleteEmployee(req, res, next) {
        try {
            await employeeService.deleteEmployee(req.params.id);
            res.status(204).json();
        } catch (error) {
            return next(new ApiError(500, "An error occurred while deleting employee"));
        }
    }
}

module.exports = new EmployeeController();