import express from "express";
import {
  signup,
  login,
  me,
  getUsers,
  deleteUser,
} from "../controllers/authController.js";

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/me", me);

// Debug / Admin routes
router.get("/users", getUsers);
router.delete("/users/:email", deleteUser);

export default router;
