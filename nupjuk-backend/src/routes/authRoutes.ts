import { Router } from "express";
import { login, registerRequest, forgotPasswordRequest } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/register-request", registerRequest);
router.post("/forgot-password-request", forgotPasswordRequest);

export default router;
