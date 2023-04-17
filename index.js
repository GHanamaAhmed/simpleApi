const express = require('express');
const app = express();
const PORT = 3000;
app.set("port", process.env.PORT || PORT);
const bodyPparser = require('body-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { studentRouter } = require('./routes/student');
const { teacherRouter } = require('./routes/teacher');
const { specialistesRouter } = require('./routes/specialistes');
const { Server } = require('socket.io');
const server = require('http').createServer(app);
const io = new Server(server);
const rooms = io.of('/rooms');
mongoose.set("strictQuery", false)
const url = "mongodb://127.0.0.1:27017/mobile";
//middleware
app.use(helmet())
app.use(bodyPparser.urlencoded({ extended: true }))
app.use((req, res, next) => {
    req.io = io;
    next();
})
app.use("/student", studentRouter)
app.use("/teacher", teacherRouter)
app.use("/specialist", specialistesRouter)
//connect with DB
const connectDB = async () => {
    try {
        await mongoose.connect(url)
        console.log("Local DB")
    } catch (error1) {
        try {
            await mongoose.connect(process.env.MONGO_URI)
            console.log("Connect succssful");
        } catch (error2) {
            console.log(error2);
            process.exit(1)
        }
    }
}
rooms.on("connection", (socket) => {
    socket.on("join-room", ({idRoom, email}) => {
        socket.id = email
        socket.join(idRoom)
    })
});
//run server
connectDB().then(() => {
    server.listen(app.get("port"))
})