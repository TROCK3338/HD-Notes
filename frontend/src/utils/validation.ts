// Validation utility functions
export interface ValidationResult {
  isValid: boolean;
  message: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: "Email is required" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }
  
  return { isValid: true, message: "" };
};

// Name validation
export const validateName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, message: "Name is required" };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: "Name must be at least 2 characters long" };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, message: "Name must be less than 50 characters" };
  }
  
  // Check for invalid characters (allow letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, message: "Name can only contain letters, spaces, hyphens, and apostrophes" };
  }
  
  return { isValid: true, message: "" };
};

// Date of Birth validation
export const validateDateOfBirth = (dob: string): ValidationResult => {
  if (!dob) {
    return { isValid: false, message: "Date of birth is required" };
  }
  
  const birthDate = new Date(dob);
  const today = new Date();
  
  // Check if date is valid
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, message: "Please enter a valid date" };
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
    return { isValid: false, message: "Please enter a valid date of birth" };
  }
  
  return { isValid: true, message: "" };
};

// OTP validation
export const validateOTP = (otp: string): ValidationResult => {
  if (!otp) {
    return { isValid: false, message: "OTP is required" };
  }
  
  if (otp.length !== 6) {
    return { isValid: false, message: "OTP must be 6 digits long" };
  }
  
  if (!/^\d+$/.test(otp)) {
    return { isValid: false, message: "OTP must contain only numbers" };
  }
  
  return { isValid: true, message: "" };
};

// Form validation for signup
export const validateSignupForm = (name: string, email: string, dob: string) => {
  const errors: { [key: string]: string } = {};
  
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
  }
  
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }
  
  const dobValidation = validateDateOfBirth(dob);
  if (!dobValidation.isValid) {
    errors.dateOfBirth = dobValidation.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};