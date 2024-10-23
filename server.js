const app = require("./app");
const http = require('http').Server(app)
const io = require('socket.io')(http,{
    cors: {
        origin: "http://localhost:5173", // Địa chỉ client của bạn
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true // Nếu bạn cần gửi cookie
    }
})
global.io=io;
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util")

async function startServer(){
    try{
        await MongoDB.connect(config.db.uri);
        console.log("Connected to the database");
        const PORT = config.app.port;
        io.on('connection', (socket) => {
            console.log(socket.id); // Đảm bảo console.log(socket.id) nằm trong hàm callback
        });
        http.listen(PORT, () => {
            console.log(`Server chạy ở port ${PORT}`);
        });
        
        
    }catch(error){
        console.log("Cannnot connect to database", error);
        process.exit();
    }
}

startServer();