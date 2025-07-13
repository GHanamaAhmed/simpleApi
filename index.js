const dotenv = require("dotenv");
dotenv.config({
  path: process.env.NODE_ENV === "production" ? "./.env.production" : "./.env.development",
});
const express = require("express");
const app = express();
const bodyPparser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const { studentRouter } = require("./routes/student");
const { teacherRouter } = require("./routes/teacher");
const { specialistesRouter } = require("./routes/specialistes");
const { Server } = require("socket.io");
const { Teacher, Student } = require("./database/database");
const server = require("http").createServer(app);
const io = new Server(server);
const rooms = io.of("/rooms");
const students = io.of("/students");
mongoose.set("strictQuery", false);
//middleware
app.use(cors());
app.use(helmet());
app.use(bodyPparser.urlencoded({ extended: true }));
//Authentication before connect to Socket.io
rooms.use(async (socket, next) => {
  const email = socket.handshake?.auth?.email;
  const password = socket.handshake?.auth?.password;
  const teacher = await Teacher.findOne({ email, password });
  const student = await Student.findOne({ email, password });
  if (teacher || student) {
    next();
  }
});
students.use(async (socket, next) => {
  const email = socket.handshake?.auth?.email;
  const password = socket.handshake?.auth?.password;
  const teacher = await Teacher.findOne({ email, password });
  const student = await Student.findOne({ email, password });
  if (teacher || student) {
    next();
  }
});
//send socket.io to router
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use("/student", studentRouter);
app.use("/teacher", teacherRouter);
app.use("/specialist", specialistesRouter);
//connect with DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
//Socket.io
rooms.on("connection", (socket) => {
  socket.on("join-room", ({ idRoom, email }) => {
    socket.join(idRoom);
  });
});
students.on("connection", (socket) => {
  socket.on("join-r", ({ email }) => {
    socket.join(email);
  });
  socket.on("join-specialist", ({ specialist }) => {
    socket.join(specialist);
  });
});
//run server
connectDB()
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to the database:", err);
    process.exit(1);
  });
