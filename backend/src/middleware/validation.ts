import type { Request, Response, NextFunction } from "express";

// Interface for validation results
interface ValidationResult {
  isValid: boolean;
  message: string;
}

// Email validation
const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: "Email is required" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please provide a valid email address" };
  }
  
  return { isValid: true, message: "" };
};

// Name validation
const validateName = (name: string): ValidationResult => {
  if (!name || !name.trim()) {
    return { isValid: false, message: "Name is required" };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: "Name must be at least 2 characters long" };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, message: "Name must be less than 50 characters" };
  }
  
  // Check for invalid characters
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, message: "Name can only contain letters, spaces, hyphens, and apostrophes" };
  }
  
  return { isValid: true, message: "" };
};

// Date of Birth validation
const validateDateOfBirth = (dob: string): ValidationResult => {
  if (!dob) {
    return { isValid: false, message: "Date of birth is required" };
  }
  
  const birthDate = new Date(dob);
  const today = new Date();
  
  // Check if date is valid
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, message: "Please provide a valid date" };
  }
  
  // Check if date is in the future
  if (birthDate > today) {
    return { isValid: false, message: "Date of birth cannot be in the future" };
  }
  
  // Calculate age
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
  
  // Age restrictions
  if (actualAge < 13) {
    return { isValid: false, message: "You must be at least 13 years old to sign up" };
  }
  
  if (actualAge > 120) {
    return { isValid: false, message: "Please provide a valid date of birth" };
  }
  
  return { isValid: true, message: "" };
};

// OTP validation
const validateOTP = (otp: string): ValidationResult => {
  if (!otp) {
    return { isValid: false, message: "OTP is required" };
  }
  
  if (otp.length !== 6) {
    return { isValid: false, message: "OTP must be exactly 6 digits" };
  }
  
  if (!/^\d+$/.test(otp)) {
    return { isValid: false, message: "OTP must contain only numbers" };
  }
  
  return { isValid: true, message: "" };
};

// Middleware for validating signup data
export const validateSignupData = (req: Request, res: Response, next: NextFunction) => {
  const { email, name, dateOfBirth } = req.body;
  
  const errors: string[] = [];
  
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.push(emailValidation.message);
  }
  
  // Validate name (optional but if provided, must be valid)
  if (name) {
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      errors.push(nameValidation.message);
    }
  }
  
  // Validate date of birth (optional but if provided, must be valid)
  if (dateOfBirth) {
    const dobValidation = validateDateOfBirth(dateOfBirth);
    if (!dobValidation.isValid) {
      errors.push(dobValidation.message);
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      message: errors.join(". "),
      errors: errors
    });
  }
  
  next();
};

// Middleware for validating OTP verification
export const validateOTPData = (req: Request, res: Response, next: NextFunction) => {
  const { email, otp } = req.body;
  
  const errors: string[] = [];
  
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.push(emailValidation.message);
  }
  
  // Validate OTP
  const otpValidation = validateOTP(otp);
  if (!otpValidation.isValid) {
    errors.push(otpValidation.message);
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      message: errors.join(". "),
      errors: errors
    });
  }
  
  next();
};

// Middleware for validating note data
export const validateNoteData = (req: Request, res: Response, next: NextFunction) => {
  const { title, content } = req.body;
  
  const errors: string[] = [];
  
  if (!title || !title.trim()) {
    errors.push("Title is required");
  } else if (title.trim().length > 100) {
    errors.push("Title must be less than 100 characters");
  }
  
  if (!content || !content.trim()) {
    errors.push("Content is required");
  } else if (content.trim().length > 5000) {
    errors.push("Content must be less than 5000 characters");
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      message: errors.join(". "),
      errors: errors
    });
  }
  
  next();
};

// Export individual validation functions for reuse
export { validateEmail, validateName, validateDateOfBirth, validateOTP };