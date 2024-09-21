const prisma = require('../../prisma/client');

class EmployeeService {
    async createEmlpoyee(data) {
        //profilePicture should be default by the "default avatar link"
        const { name, profilePicture, employeeAdress, employeeGender, employeeDateOfBirth, positionId, departmentId, accountAuthory } = data;
    
        //create a person
        const person = await prisma.person.create({
            data: {
                name: name,
                profilePicture: profilePicture,
            }
        });

        //create an employee linked to that person
        const employee = await prisma.employee.create({
            data: {
                employeeAdress,
                employeeGender,
                employeeDateOfBirth,
                personId: person.id,
            }
        });

        const work = await prisma.work.create({
            data: {
                positionId,
                departmentId,
                employeeId: employee.id,
            }
        });

        const account = await prisma.account.create({
            data: {
                //temporary username and password, will figured out how to generate it later
                accountUsername: name,
                accountPassword: '123456',
                accountAuthory: accountAuthory, //1 for employee //0 for admins //2 for clients
                personId: person.id,
            }
        });

        return employee;
    }

    async getEmployeeById(id) {
        return await prisma.employee.findUnique({
            where: { id },
            include:{
                Person: {
                    include: {
                    account: true,
                    },
                },
                Work: {
                    include: {
                        Position: true,
                        Department: true
                    }
                },
            },
        });
    }

    async getAllEmployees() {
        return await prisma.employee.findMany({
        where: { isDeleted: false },
        include:{
            Person: {
                include: {
                account: true,
                },
            },
            Work: {
                include: {
                    Position: true,
                    Department: true,
                }
            },
        },
        });
    }

    async updateEmployee(id, data) {
        const { name, profilePicture, employeeAdress, employeeGender, employeeDateOfBirth, departmentId, positionId} = data;
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                Person: {
                    include: {
                    account: true,
                    },
                },
                work: {
                    include: {
                        position: true,
                        department: true
                },
                work: true,
                }, // Include person details
            },
        });

        if (!employee) {
            throw new Error('Employee not found');
        }

        await prisma.person.update({
            where: { id: employee.personId },
            data: {
            name: name,
            profilePicture: profilePicture,
            }
        });

        await prisma.work.update({
            where: { id: employee.workId },
            data: {
                positionId: positionId,
                departmentId: departmentId,
            }
        }); 

        const updatedEmployee = await prisma.employee.update({
            where: { id },
            data: {
                employeeAdress: employeeAdress,
                employeeDateOfBirth: employeeDateOfBirth,
                employeeGender: employeeGender,
            }
        });


        return updatedEmployee;

    }

    async deleteEmployee(id) {
        // Soft delete (set isDeleted to true) for both Employee and related Person
        const employee = await prisma.employee.update({
        where: { id },
            data: { isDeleted: true },
        });

        // Soft delete related Person using personId from the Employee
        const person = await prisma.person.update({
        where: { id: employee.personId },
            data: { isDeleted: true },
        });

        const work = await prisma.work.update({
        where: { id: employee.workId },
            data: { isDeleted: true },
        });

        const account = await prisma.account.update({
        where: { id: person.accountId },
            data: { isDeleted: true },
        });

        return { employee, person };
    }
}


module.exports = new EmployeeService();

