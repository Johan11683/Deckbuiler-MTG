import express from "express";
import {
  createDeck,
  getDecks,
  getDeckById,
  deleteDeck,
  addCardToDeck,
  removeCardFromDeck,
  updateDeck,   // 👈 ici
} from "../controllers/deckController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Toutes les routes deck sont protégées par JWT
router.post("/", authMiddleware, createDeck);                  
router.get("/", authMiddleware, getDecks);                     
router.get("/:id", authMiddleware, getDeckById);               
router.patch("/:id", authMiddleware, updateDeck);              // 👈 rename / update
router.post("/:id/cards", authMiddleware, addCardToDeck);      
router.delete("/:id/cards/:cardIndex", authMiddleware, removeCardFromDeck); 
router.delete("/:id", authMiddleware, deleteDeck);             

export default router;
