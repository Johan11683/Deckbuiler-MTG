import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    scryfallId: { type: String, required: true },
    name: { type: String, required: true },
    manaCost: { type: String },
    typeLine: { type: String },
    oracleText: { type: String },
    power: { type: String },
    toughness: { type: String },
    imageUrl: { type: String },
    setName: { type: String },
    cmc: { type: Number },
    count: { type: Number, default: 1 },
  },
  { _id: false }
);

const deckSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cards: [cardSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Deck", deckSchema);
