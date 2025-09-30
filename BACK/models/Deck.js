import mongoose from "mongoose";

const deckSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cards: { type: [String], default: [] }, // ✅ tableau de cartes
  },
  { timestamps: true }
);

const Deck = mongoose.model("Deck", deckSchema);

export default Deck;
