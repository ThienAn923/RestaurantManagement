const prisma = require("../../prisma/client");

class ClientService {
  async getClientTemporaryById(id) {
    try {
      return await prisma.clientTemporary.findUnique({
        where: { id },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async createClientTemporary(data) {
    try {
      return await prisma.clientTemporary.create({ data });
    } catch (error) {
      console.log(error);
    }
  }

  async updateClientTemporary(id, data) {
    try {
      console.log("id, data", id, data);
      return await prisma.clientTemporary.update({
        where: { id },
        data: {
          phoneNumber: data.phoneNumber,
          name: data.name,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async deleteClientTemporary(id) {
    try {
      return await prisma.clientTemporary.delete({
        where: { id },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAllClientsTemporary(
    page = 1,
    limit = 5,
    search = "",
    sortColumn = "createAt",
    sortOrder = "desc"
  ) {
    console.log("testing pagrams", page, limit, search, sortColumn, sortOrder);
    try {
      let where;
      if (search !== "") {
        where = {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phoneNumber: { contains: search, mode: "insensitive" } },
          ],
        };
      }

      console.log("where", JSON.stringify(where));

      const [clients, total] = await Promise.all([
        prisma.clientTemporary.findMany({
          where,
          orderBy: { [sortColumn]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.clientTemporary.count({ where }),
      ]);

      console.log(clients, total);

      return {
        data: clients,
        total,
        limit,
        page,
        totalPage: Math.ceil(total / limit),
      };
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = new ClientService();

// export const getClientTemporaryById = async (id) => {
//   try {
//     return await prisma.clientTemporary.findUnique({
//       where: { id },
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const createClientTemporary = async (data) => {
//   try {
//     return await prisma.clientTemporary.create({ data });
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const updateClientTemporary = async (id, data) => {
//   try {
//     return await prisma.clientTemporary.update({
//       where: { id },
//       data,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const deleteClientTemporary = async (id) => {
//   try {
//     return await prisma.clientTemporary.delete({
//       where: { id },
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const getAllClientsTemporary = async (
//   page = 1,
//   limit = 5,
//   search = "",
//   sortColumn = "createAt",
//   sortOrder = "desc"
// ) => {
//   try {
//     let where;
//     if (search !== "") {
//       where = {
//         OR: [
//           { name: { contains: search, mode: "insensitive" } },
//           { phoneNumber: { contains: search, mode: "insensitive" } },
//         ],
//       };
//     }

//     const [clients, total] = await Promise.all([
//       prisma.clientTemporary.findMany({
//         where,
//         orderBy: { [sortColumn]: sortOrder },
//         skip: (page - 1) * limit,
//         take: limit,
//       }),
//       prisma.clientTemporary.count({ where }),
//     ]);

//     return {
//       clients,
//       total,
//     };
//   } catch (error) {
//     console.log(error);
//   }
// };

// // const clientTemporaryService = {
// //   getClientTemporaryById,
// //   createClientTemporary,
// //   updateClientTemporary,
// //   deleteClientTemporary,
// //   getAllClientsTemporary,
// // };

// // export default clientTemporaryService;
