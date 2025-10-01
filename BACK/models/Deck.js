import mongoose from "mongoose";

const deckSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cards: [
    {
      name: { type: String, required: true },
      manaCost: String,
      type: String,
      quantity: { type: Number, default: 1 },
    },
  ],
}, { timestamps: true });

const Deck = mongoose.model("Deck", deckSchema);

export default Deck; // ✅ export par défaut
