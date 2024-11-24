// import clientTemporaryService from "../services/clientTemporary.service.js";
// import ApiError from "../api-error.js";
const clientTemporaryService = require("../services/clientTemporary.service");
const ApiError = require("../api-error");

class ClientTemporaryController {
  async createClientTemporary(req, res, next) {
    try {
      const clientTemporary =
        await clientTemporaryService.createClientTemporary(req.body);
      res.status(201).json(clientTemporary);
    } catch (error) {
      throw new ApiError(500, error.message);
    }
  }

  async getClientTemporaryById(req, res, next) {
    try {
      const clientTemporary =
        await clientTemporaryService.getClientTemporaryById(req.params.id);
      if (!clientTemporary) {
        return res.status(404).json({ message: "ClientTemporary not found" });
      }
      res.status(200).json(clientTemporary);
    } catch (error) {
      return next(new ApiError(500, error.message));
    }
  }

  async updateClientTemporary(req, res, next) {
    try {
      const clientTemporary =
        await clientTemporaryService.updateClientTemporary(
          req.params.id,
          req.body
        );
      res.status(200).json(clientTemporary);
    } catch (error) {
      throw new ApiError(500, error.message);
    }
  }

  async deleteClientTemporary(req, res, next) {
    try {
      await clientTemporaryService.deleteClientTemporary(req.params.id);
      res.status(204).end();
    } catch (error) {
      throw new ApiError(500, error.message);
    }
  }

  async getAllClientsTemporary(req, res, next) {
    try {
      // const { page, limit, search, sortColumn, sortOrder } = req.query; //cant parse lol
      let { page, limit, ...otherPagrams } = req.query;
      const { sortColumn, sortOrder, search } = otherPagrams;
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 5;

      console.log("object", page, limit, search, sortColumn, sortOrder);
      const clientsTemporary =
        await clientTemporaryService.getAllClientsTemporary(
          page,
          limit,
          search,
          sortColumn,
          sortOrder
        );
      res.status(200).json(clientsTemporary);
    } catch (error) {
      throw new ApiError(500, error.message);
    }
  }
}

module.exports = new ClientTemporaryController();
// async createClientTemporary(req, res, next) {
//   try {
//     const clientTemporary = await clientTemporaryService.createClientTemporary(
//       req.body
//     );
//     res.status(201).json(clientTemporary);
//   } catch (error) {
//     throw new ApiError(500, error.message);
//   }
// };

// export const getClientTemporaryById = async (req, res, next) => {
//   try {
//     const clientTemporary = await clientTemporaryService.getClientTemporaryById(
//       req.params.id
//     );
//     if (!clientTemporary) {
//       return res.status(404).json({ message: "ClientTemporary not found" });
//     }
//     res.status(200).json(clientTemporary);
//   } catch (error) {
//     return next(
//       new ApiError(500, "An error occurred while retrieving clientTemporary")
//     );
//   }
// };

// export const updateClientTemporary = async (req, res, next) => {
//   try {
//     const clientTemporary = await clientTemporaryService.updateClientTemporary(
//       req.params.id,
//       req.body
//     );
//     res.status(200).json(clientTemporary);
//   } catch (error) {
//     throw new ApiError(500, error.message);
//   }
// };

// export const deleteClientTemporary = async (req, res, next) => {
//   try {
//     await clientTemporaryService.deleteClientTemporary(req.params.id);
//     res.status(204).end();
//   } catch (error) {
//     throw new ApiError(500, error.message);
//   }
// };

// export const getAllClientsTemporary = async (req, res, next) => {
//   try {
//     const { page, limit, search, sortColumn, sortOrder } = req.query;
//     const clientsTemporary =
//       await clientTemporaryService.getAllClientsTemporary(
//         page,
//         limit,
//         search,
//         sortColumn,
//         sortOrder
//       );
//     res.status(200).json(clientsTemporary);
//   } catch (error) {
//     throw new ApiError(500, error.message);
//   }
// };

// // const clientTemporaryController = {
// //   createClientTemporary,
// //   getClientTemporaryById,
// //   updateClientTemporary,
// //   deleteClientTemporary,
// //   getAllClientsTemporary,
// // };

// // export default clientTemporaryController;
