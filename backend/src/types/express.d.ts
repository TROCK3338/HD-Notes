import { Request } from "express";
import { IUser } from "../models/User";

declare global {
  namespace Express {
    interface User extends IUser {}
    
    interface Request {
      user?: User;
      logout?: (callback?: (err: any) => void) => void;
      logOut?: (callback?: (err: any) => void) => void;
      isAuthenticated?: () => boolean;
      isUnauthenticated?: () => boolean;
    }
  }
}

export {};
