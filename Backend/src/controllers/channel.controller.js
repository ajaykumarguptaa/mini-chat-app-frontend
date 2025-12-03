import { Channel } from "../models/channel.model.js";

export const createChannel = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    const existing = await Channel.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Channel name already exists" });
    }

    const channel = await Channel.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id]
    });

    res.status(201).json(channel);
  } catch (err) {
    console.error("Create channel error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find({})
      .populate("createdBy", "name")
      .select("-__v");
    res.json(channels);
  } catch (err) {
    console.error("Get channels error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const joinChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    if (!channel.members.includes(req.user._id)) {
      channel.members.push(req.user._id);
      await channel.save();
    }

    res.json({ message: "Joined channel", channel });
  } catch (err) {
    console.error("Join channel error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const leaveChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    channel.members = channel.members.filter(
      (m) => m.toString() !== req.user._id.toString()
    );
    await channel.save();

    res.json({ message: "Left channel", channel });
  } catch (err) {
    console.error("Leave channel error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
