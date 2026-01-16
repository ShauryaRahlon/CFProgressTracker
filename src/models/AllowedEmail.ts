import mongoose, { Schema, models } from "mongoose";

const AllowedEmailSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    password: { type: String }, // optional pre-set password (hashed)
  },
  { timestamps: true }
);

export default models.AllowedEmail ||
  mongoose.model("AllowedEmail", AllowedEmailSchema);
