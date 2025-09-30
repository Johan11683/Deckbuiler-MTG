import express from "express";
import { createDeck, getDecks, deleteDeck } from "../controllers/deckController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Toutes les routes deck sont protégées par JWT
router.post("/", authMiddleware, createDeck);
router.get("/", authMiddleware, getDecks);
router.delete("/:id", authMiddleware, deleteDeck);

export default router;
