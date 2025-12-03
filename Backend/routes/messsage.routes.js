import { Router } from "express";

import { authMiddleware } from "../src/middleware/Auth.middleware.js";
import { getMessages } from "../src/controllers/message.controller.js";

const messageRouter = Router();

messageRouter.use(authMiddleware);

messageRouter.get("/:channelId", getMessages);
export default messageRouter;