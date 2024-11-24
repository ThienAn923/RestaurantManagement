import prisma from "../../prisma/client";

export const getQrCodeById = async (id) => {
  try {
    return await prisma.qrCode.findUnique({
      where: { id },
    });
  } catch (error) {
    console.log(error);
  }
};

export const createQrCode = async (data) => {
  return await prisma.qrCode.create({ data });
};
