// Cấu hình thông tin cần thiết để kết nối với ZaloPay
const ZaloPayConfig = {
  appId: "2554",
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  appUser: "zalopaydemo",
};

const Endpoints = {
  createOrderUrl: "https://api.zalopay.vn/v1/create-order", // URL API tạo đơn hàng của ZaloPay
};

module.exports = {
  ZaloPayConfig,
  Endpoints,
};
