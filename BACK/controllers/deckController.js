import Deck from "../models/Deck.js";

// 🟢 Créer un deck lié au user
export const createDeck = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Nom du deck requis" });
    }

    const deck = new Deck({
      name: name.trim(),
      user: req.userId, // 🗝️ req.userId injecté par authMiddleware
      cards: [],
    });

    await deck.save();
    res.status(201).json(deck);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🟢 Récupérer les decks de l’utilisateur connecté
export const getDecks = async (req, res) => {
  try {
    const decks = await Deck.find({ user: req.userId });
    res.json(decks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🟢 Supprimer un deck
export const deleteDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Deck.findOneAndDelete({ _id: id, user: req.userId });

    if (!deleted) {
      return res.status(404).json({ message: "Deck introuvable ou non autorisé" });
    }

    res.json({ message: "Deck supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
