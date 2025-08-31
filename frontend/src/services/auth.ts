import api from "./api";

export const signup = (email: string, name?: string, dateOfBirth?: string) => 
  api.post("/auth/signup", { email, name, dateOfBirth });
export const sendOtp = (email: string, name?: string, dateOfBirth?: string) => 
  api.post("/auth/signup", { email, name, dateOfBirth });
export const verifyOTP = (email: string, otp: string) => api.post("/auth/otp/verify", { email, otp });
export const getMe = () => api.get("/auth/me");
export const logout = () => api.post("/auth/logout");