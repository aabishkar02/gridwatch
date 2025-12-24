import express from "express"
import { register, login, logout, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp, changePassword, getApiKey, createNewApiKey } from "../controllers/authController.js";
import {userAuth} from "../middleware/userAuth.js";


export const authRouter = express.Router();

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.post("/logout", logout)
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp)
authRouter.post("/verify-account", userAuth, verifyEmail)
authRouter.post("/is-auth", userAuth, isAuthenticated)

authRouter.post("/send-reset-otp", sendResetOtp)
authRouter.post("/reset-password", changePassword)

authRouter.post("/get-api-key", userAuth, getApiKey)
authRouter.post("/request-new-api-key", userAuth, createNewApiKey)