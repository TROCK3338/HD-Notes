import { Router } from "express";
import passport from "passport";
import { signup, verifyOTP, login, logout, me, googleAuth, googleCallback } from "../controllers/authController";
import { validateSignupData, validateOTPData } from "../middleware/validation";

const router = Router();

router.post("/signup", validateSignupData, signup);
router.post("/otp/verify", validateOTPData, verifyOTP);
router.post("/login", validateSignupData, login);
router.post("/logout", logout);
router.get("/me", me);

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/signin?error=auth_failed`,
    session: false // Disable sessions
  }), 
  googleCallback
);

export default router;