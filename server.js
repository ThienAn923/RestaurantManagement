require("dotenv").config();
const { updateTableStatus } = require("./app/utils/cronjob"); // Import the updateTableStatus function
const app = require("./app");
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:5173", // Địa chỉ client của bạn
    methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức cho phép
    allowedHeaders: ["my-custom-header"],
    credentials: true, // Nếu bạn cần gửi cookie
  },
});
global.io = io;
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");

//new
const MessageService = require("./app/services/messageChat.service");

async function startServer() {
  try {
    await MongoDB.connect(config.db.uri);
    console.log("Connected to the database");
    const PORT = config.app.port;
    io.on("connection", (socket) => {
      console.log(`New connection: ${socket.id}`);
      socket.on("OnConnected", (user) => {
        console.log(user);
      });
      MessageService.getAllMessages().then((messages) => {
        socket.emit("allMessages", messages);
        console.log(messages);
      });

      socket.on("sendMessage", async (messageData) => {
        await MessageService.createMessage(messageData); // Tạo tin nhắn mới trong cơ sở dữ liệu
        io.emit("messageCreated", messageData);
        // Phát tin nhắn cho tất cả người dùng
      });
    });

    http.listen(PORT, () => {
      console.log(`Server running at port: ${PORT}`);
    });

    // Call the updateTableStatus function
    //Why? Because we want to update the table status when the server starts
    //And we want to update the table status every day
    //Because the table status will NEED to be update to false if the table have an order for that day
    //The table can have many orders, but the table status will be false if the table have an order for that day
    //It's complicated lol
    updateTableStatus(); // Run the updateTableStatus function
  } catch (error) {
    console.log("Cannnot connect to database", error);
    process.exit();
  }
}

startServer();

//Old, but as i copied the new one, i will keep this one here, incase... worst thing happen...
// const app = require("./app");
// const config = require("./app/config");
// const MongoDB = require("./app/utils/mongodb.util")

// async function startServer(){
//     try{
//         await MongoDB.connect(config.db.uri);
//         console.log("Connected to the database");
//         const PORT = config.app.port;
//         app.listen(PORT, () => {
//             console.log(`Server running on ${PORT}`);
//         });
//     }catch(error){
//         console.log("Cannnot connect to database", error);
//         process.exit();
//     }
// }

// startServer();
