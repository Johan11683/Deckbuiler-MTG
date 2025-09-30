import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import deckRoutes from "./routes/deck.js";


console.log("DEBUG process.env :", process.env);
console.log("🔑 JWT_SECRET chargé :", process.env.JWT_SECRET ? "OK" : "❌ undefined");

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // autorise ton front
  credentials: true,               // si tu veux plus tard des cookies/JWT
}));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/decks", deckRoutes);

// ✅ Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB Atlas"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err));

// ✅ Lancement serveur
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
