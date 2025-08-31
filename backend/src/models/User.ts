import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  dateOfBirth?: Date;   
  otp?: string;
  otpExpiry?: Date;
  googleId?: string;
}

const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  dateOfBirth: { type: Date },
  otp: { type: String },
  otpExpiry: { type: Date },
  googleId: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IUser>("User", UserSchema);
