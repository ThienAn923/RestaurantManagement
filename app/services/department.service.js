const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class DepartmentService {
  async createDepartment(data) {
    return await prisma.Department.create({ data });
  }

  async getDepartmentById(id) {
    return await prisma.Department.findUnique({
      where: { id },
    });
  }

  async getAllDepartmentsREAL() {
    return await prisma.Department.findMany({
      where: { isDeleted: false },
    });
  }

  //pinia
  // async getAllDepartments(page = 1, limit = 5) {
  //     const skip = (page - 1) * limit;
  //     const [departments, total] = await Promise.all([
  //     prisma.Department.findMany({
  //         where: { isDeleted: false },
  //         skip,
  //         take: limit,
  //         orderBy: { createAt: 'desc' },
  //     }),
  //     prisma.Department.count({ where: { isDeleted: false } }),
  //     ]);

  //     return {
  //     departments,
  //     total,
  //     page,
  //     limit,
  //     totalPages: Math.ceil(total / limit),
  //     };
  // }

  //pinia with sort
  async getAllDepartments(
    page = 1,
    limit = 5,
    sortColumn = "createAt",
    sortOrder = "asc",
    search = ""
  ) {
    const skip = (page - 1) * limit;
    const allowedSortColumns = [
      "departmentName",
      "totalEmployee",
      "headOfDepartment",
      "createAt",
    ];
    const orderBy = {};
    // Ensure sortColumn is valid
    if (allowedSortColumns.includes(sortColumn)) {
      orderBy[sortColumn] = sortOrder.toLowerCase() === "desc" ? "desc" : "asc";
    } else {
      orderBy.createAt = "asc"; // Default sorting
    }

    // Ensure sortOrder is valid
    sortOrder = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

    let where = {
      isDeleted: false,
    };

    if (search !== "") {
      where = {
        ...where,
        departmentName: { contains: search, mode: "insensitive" },
      };
    }

    const [data, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          Employee: {
            include: {
              person: true,
            },
          },
        },
      }),
      prisma.department.count({ where }),
    ]);

    //DEBUG BIG BUGS
    // const departments = await prisma.department.findMany({
    //     select: {
    //         id: true,
    //     },
    // });
    // const departmentEmployeeCounts = await Promise.all(
    //     departments.map(async (dept) => {
    //         const count = await prisma.Work.count({
    //         //do not change endDate to null!!!!, it wont result shits
    //         where: { endDate: undefined, departmentID: dept.id },
    //         });
    //         return { departmentID: dept.id, totalEmployee: count };
    //     })
    // );

    // console.log(departmentEmployeeCounts);

    const departmentsWithEmployeeCount = await Promise.all(
      data.map(async (dept) => {
        const totalEmployee = await prisma.Work.count({
          where: { departmentID: dept.id, endDate: undefined }, // Assuming null endDate means current employee
        });
        // console.log(dept.id);
        return {
          ...dept,
          totalEmployee,
          headOfDepartment: dept.Employee
            ? {
                id: dept.Employee.id,
                name: dept.Employee.person.name,
                profilePicture: dept.Employee.person.profilePicture,
                employeeAddress: dept.Employee.employeeAdress,
              }
            : null,
        };
      })
    );

    // totalEmployee = await prisma.Employee.count({ where: { data: id } });

    return {
      data: departmentsWithEmployeeCount,
      total,
      page,
      limit,
      search,
      totalPages: Math.ceil(total / limit),
    };
  }
  async updateDepartment(id, data) {
    return await prisma.Department.update({
      where: { id },
      data,
    });
  }

  async deleteDepartment(id) {
    // Soft delete (set isDeleted to true)
    return await prisma.Department.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}

module.exports = new DepartmentService();
