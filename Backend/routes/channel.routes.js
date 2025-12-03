import { Router } from "express";

import { authMiddleware } from "../src/middleware/Auth.middleware.js";
import {
  createChannel,
  getChannels,
  joinChannel,
  leaveChannel,
} from "../src/controllers/channel.controller.js";

const channelRouter = Router();

channelRouter.use(authMiddleware);

channelRouter.post("/", createChannel);
channelRouter.get("/", getChannels);
channelRouter.post("/:id/join", joinChannel);
channelRouter.post("/:id/leave", leaveChannel);

export default channelRouter;
