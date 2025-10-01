// models/Deck.js
import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  scryfallId: { type: String, required: true },  // id unique
  name: { type: String, required: true },
  manaCost: { type: String },
  typeLine: { type: String },
  oracleText: { type: String },
  power: { type: String },
  toughness: { type: String },
  colors: [{ type: String }],
  imageUrl: { type: String },
  rarity: { type: String },
  setName: { type: String },
  cmc: { type: Number }
}, { _id: false }); // pas besoin d’un _id séparé pour chaque carte

const deckSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cards: [cardSchema] // un deck contient plusieurs cartes
}, { timestamps: true });

export default mongoose.model("Deck", deckSchema);
