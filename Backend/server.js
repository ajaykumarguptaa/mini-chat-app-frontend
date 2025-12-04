import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import { connectdb } from "./src/config/db.js";

import { initSocket } from "./src/sockets/index.js";
import AuthRouter from "./routes/auth.routes.js";
import channelRouter from "./routes/channel.routes.js";
import messageRouter from "./routes/messsage.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());


const allowedOrigins = [
  "http://localhost:5173",
  "https://chatapp-frontend-sa8t.onrender.com", 
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,  // <- IMPORTANT
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.options("*", cors());


app.get("/", (req, res) => {
  res.send("Team Chat API running");
});

app.use("/api/auth", AuthRouter);
app.use("/api/channels", channelRouter);
app.use("/api/messages", messageRouter);


const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,  
  },
});


initSocket(io);


const PORT = process.env.PORT || 5000;

connectdb()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running at port ${PORT}`);
    });
  })
  .catch((err) => console.error("DB connection error:", err));
