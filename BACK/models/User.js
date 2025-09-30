import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // pas deux comptes avec le même email
    match: [/^\S+@\S+\.\S+$/, "Email invalide"], // regex email
  },
  password: {
    type: String,
    required: true,
    minlength: 8, // minimum 8 caractères
  },
}, { timestamps: true }); // createdAt / updatedAt auto

export default mongoose.model("User", userSchema);
