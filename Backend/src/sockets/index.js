import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { Message } from "../models/message.model.js";
const onlineUsers = new Map();

export const initSocket = (io) => {
  io.on("connection", async (socket) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.log("No token, disconnecting.... socket");
      socket.disconnect();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      socket.userId = userId;

      onlineUsers.set(userId.toString(), socket.id);

      await User.findByIdAndUpdate(userId, { online: true });

      io.emit("user-online", { userId });

      console.log(" user connected:", userId);

      socket.on("join-channel", (channelId) => {
        socket.join(channelId);
      });

      socket.on("leave-channel", (channelId) => {
        socket.leave(channelId);
      });

      socket.on("send-message", async ({ channelId, text }) => {
        if (!channelId || !text) return;

        const msg = await Message.create({
          channelId,
          sender: userId,
          text,
        });

        const populated = await msg.populate("sender", "name");

        io.to(channelId).emit("receive-message", {
          _id: populated._id,
          text: populated.text,
          channelId: populated.channelId,
          sender: {
            _id: populated.sender._id,
            name: populated.sender.name,
          },
          createdAt: populated.createdAt,
        });
      });

      socket.on("disconnect", async () => {
        console.log("user disconnected:", userId);

        onlineUsers.delete(userId.toString());
        await User.findByIdAndUpdate(userId, { online: false });

        io.emit("user-offline", { userId });
      });
    } catch (err) {
      console.error("Socket auth error:", err.message);
      socket.disconnect();
    }
  });
};
