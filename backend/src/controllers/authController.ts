import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import User, { IUser } from "../models/User";
import nodemailer from "nodemailer";

const generateOTP = (): string => Math.floor(100000 + Math.random() * 900000).toString();

const sendEmail = async (email: string, otp: string): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code - Note Taking App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your OTP Code</h2>
          <p>Your one-time password is: <strong style="font-size: 18px; color: #007bff;">${otp}</strong></p>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`
    });

    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Signup: Generate OTP and send email
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, name, dateOfBirth } = req.body;

  try {
    // Validate required fields
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ 
        email, 
        name: name || undefined, 
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined 
      });
    } else {
      // Update existing user's info if provided
      if (name) user.name = name;
      if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    await user.save();

    await sendEmail(email, otp);

    res.json({ message: "OTP sent to email successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    
    if (errorMessage.includes('Failed to send OTP email')) {
      res.status(500).json({ message: "Error sending OTP email. Please check your email address and try again." });
    } else {
      res.status(500).json({ message: "Error processing signup. Please try again." });
    }
  }
};

// Verify OTP: Check and issue JWT
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || String(user.otp) !== String(otp) || !user.otpExpiry || user.otpExpiry < new Date()) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    // Clear OTP after verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: "1h" }
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000
    });

    res.json({ 
      message: "OTP verified", 
      user: { 
        id: user._id,
        email: user.email, 
        name: user.name,
        dateOfBirth: user.dateOfBirth
      } 
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "Error verifying OTP. Please try again." });
  }
};

// Login (request OTP again)
export const login = async (req: Request, res: Response): Promise<void> => {
  await signup(req, res); // same as signup flow
};

// Logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear the JWT cookie
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none"
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: "Error during logout" });
  }
};

// Me
export const me = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.["access_token"];
  if (!token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const user = await User.findById(decoded.id).select("-otp -otpExpiry");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    res.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        dateOfBirth: user.dateOfBirth 
      } 
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Google OAuth handlers
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false // Disable sessions, we'll use JWT
});

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser;
    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL}/signin?error=auth_failed`);
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error("Google callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/signin?error=auth_failed`);
  }
};
