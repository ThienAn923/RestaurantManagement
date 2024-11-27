const express = require("express");
const cors = require("cors");
const qs = require('qs');
const CryptoJS = require('crypto-js'); 
const axios = require('axios').default;
const moment = require('moment');
const session = require("express-session");
const app = express();
require("dotenv").config();
const dishRouter = require("./app/route/dish.route");
const dishTypeRouter = require("./app/route/dishType.route");
const accountRouter = require("./app/route/account.route");
const clientRouter = require("./app/route/client.route.js");
const departmentRouter = require("./app/route/department.route");
const employeeRouter = require("./app/route/employee.route");
const importInvoiceRouter = require("./app/route/importInvoice.route");
const ingredientRouter = require("./app/route/ingredient.route");
const invoiceRouter = require("./app/route/invoice.route");
const orderRouter = require("./app/route/order.route");
const ingredientTypeRouter = require("./app/route/ingredientType.route");
const positionRouter = require("./app/route/position.route");
const promotionRouter = require("./app/route/promotion.route");
const tableRouter = require("./app/route/table.route");
const login = require("./app/route/login.route");
const providerRouter = require("./app/route/provider.route");
const orderDetailRouter = require("./app/route/orderDetail.route");
const expenseRouter = require("./app/route/expense.route");
const clientTemporaryRouter = require("./app/route/clientTemporary.route");
const commentRouter = require("./app/route/comment.route.js");
const ratingRouter = require("./app/route/rating.route.js");
//merge
const roomChatRouter = require("./app/route/roomChat.route");
const messageChatRouter = require("./app/route/messageChat.route");

const ApiError = require("./app/api-error");
const { comment, rating } = require("./prisma/client.js");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));
app.get("/", (req, res) => {
  res.json({ message: "Welcome to ThienAn Restaurant" });
});
app.get("/dish", (req, res) => {
  res.json({
    message:
      "test, (This message was originally just simply Test but at one point, 1AM, i was high and i spend like 30 minutes trying to figure out why the /dish dont work, i was so confused, i was like, i did everything right, why it dont work, then i realized that i forgot to put the /api in front of the /dish, i was so high, i was like bruh)",
  });
});
//zalo payment method
// zalopay payment method
const config = {
  app_id: "2554",
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nh",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};
app.post("/api/payment",async (req,res) =>
{
  const embed_data = {
      redirecturl : "https://google.com"
  };

  const items = [{}];
  const transID = Math.floor(Math.random() * 1000000);
  const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: "user123",
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: 50000,
      description: `Lazada - Payment for the order #${transID}`,
      bank_code: "",
      callback_url: "https://7649-2402-800-6390-8c02-3104-d343-dff5-8cc6.ngrok-free.app/callback"
  };
  
  // appid|app_trans_id|appuser|amount|apptime|embeddata|item
  const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
  try {
      const result = await axios.post(config.endpoint, null, { params: order });
      return res.status(200).json(result.data);
  } catch (error) {
      console.log(error.message);
  }
});
app.post("/api/callback",async (req,res)=>
{
  let result = {}; 
  try {
      let dataStr = req.body.data;
      let reqMac = req.body.mac;
  
      let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
      console.log("mac =", mac);
  
  
      // kiểm tra callback hợp lệ (đến từ ZaloPay server)
      if (reqMac !== mac) {
        // callback không hợp lệ
        result.return_code = -1;
        result.return_message = "mac not equal";
      }
      else {
        // thanh toán thành công
        // merchant cập nhật trạng thái cho đơn hàng
        let dataJson = JSON.parse(dataStr, config.key2);
        console.log("update order's status = success where app_trans_id =", dataJson["app_trans_id"]);
  
        result.return_code = 1;
        result.return_message = "success";
      }
    } catch (ex) {
      result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
      result.return_message = ex.message;
    }
  
    // thông báo kết quả cho ZaloPay server
    res.json(result);
})
app.post("/api/zalopayStatus/:app_trans_id", async (req,res)=>
{   
  const app_trans_id = req.params.app_trans_id;
  let postData = {
      app_id: config.app_id,
      app_trans_id: app_trans_id, // Input your app_trans_id
  }
  
  let data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
  postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
  
  
  let postConfig = {
      method: 'post',
      url: "	https://sb-openapi.zalopay.vn/v2/query",
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify(postData)
  };
  
 try {
  const result = await axios(postConfig);
  return res.status(200).json(result.data);
 } catch (error) {
  console.log(error.message);
 }
})

//
//recommendation system 
app.post('/recommend', async (req, res) => {
    try {
        const { clientID, numRecommendations, apiURL } = req.body;
        // Gửi yêu cầu đến Flask API
        const response = await axios.post('http://127.0.0.1:5000/recommend', {
            clientID,
            numRecommendations,
            apiURL, // Truyền URL API vào Flask
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});
//
app.use("/api/rating",ratingRouter);

app.use("/api/comment",commentRouter);

app.use("/login", login);

app.use("/api/dish", dishRouter);

app.use("/api/DishType", dishTypeRouter);

app.use("/api/account", accountRouter);

app.use("/api/client", clientRouter);

app.use("/api/department", departmentRouter);

app.use("/api/employee", employeeRouter);

app.use("/api/importInvoice", importInvoiceRouter);

app.use("/api/ingredient", ingredientRouter);

app.use("/api/invoice", invoiceRouter);

app.use("/api/order", orderRouter);

app.use("/api/ingredientType", ingredientTypeRouter);

app.use("/api/position", positionRouter);

app.use("/api/promotion", promotionRouter);

app.use("/api/table", tableRouter);

app.use("/api/provider", providerRouter);

app.use("/api/orderDetail", orderDetailRouter);

app.use("/api/expense", expenseRouter);

app.use("/api/clientTemporary", clientTemporaryRouter);

app.use("/api/messageChat", messageChatRouter);

app.use("/api/roomChat", roomChatRouter);

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
