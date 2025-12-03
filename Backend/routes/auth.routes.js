import { Router } from "express";
import { getMe, login, register } from "../src/controllers/Auth.controller.js";
import { authMiddleware } from "../src/middleware/Auth.middleware.js";

const AuthRouter = Router();

AuthRouter.post("/signup",register );
AuthRouter.post("/login", login);
AuthRouter.get("/me", authMiddleware, getMe);

export default AuthRouter;