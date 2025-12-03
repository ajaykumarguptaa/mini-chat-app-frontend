import { Message } from "../models/message.model.js";

export const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);

    const skip = (page - 1) * limit;

    const messages = await Message.find({ channelId })
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit)
      .populate("sender", "name");

    res.json({
      page,
      limit,
      count: messages.length,
      messages: messages.reverse()
    });
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const msg = await Message.findById(messageId);
    if (!msg) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (msg.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    msg.deleted = true;
    msg.text = "";
    msg.deletedAt = new Date();
    await msg.save();

    return res.status(200).json({ message: "Message deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
