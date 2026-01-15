import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    role: { type: String, enum: ["admin", "user"] },
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);
