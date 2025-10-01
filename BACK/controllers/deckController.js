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

// 🟢 Récupérer un deck précis
export const getDeckById = async (req, res) => {
  try {
    const { id } = req.params;
    const deck = await Deck.findOne({ _id: id, user: req.userId });

    if (!deck) {
      return res.status(404).json({ message: "Deck introuvable ou non autorisé" });
    }

    res.json(deck);
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

// 🟢 Ajouter une carte dans un deck
export const addCardToDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const { cardName } = req.body;

    if (!cardName || cardName.trim() === "") {
      return res.status(400).json({ message: "Nom de carte requis" });
    }

    const deck = await Deck.findOne({ _id: id, user: req.userId });
    if (!deck) {
      return res.status(404).json({ message: "Deck introuvable" });
    }

    deck.cards.push(cardName.trim());
    await deck.save();

    res.json(deck);
  } catch (err) {
    console.error("❌ Erreur ajout carte:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer une carte d’un deck
export const removeCardFromDeck = async (req, res) => {
  try {
    const { id, cardIndex } = req.params;

    const deck = await Deck.findOne({ _id: id, user: req.userId });
    if (!deck) {
      return res.status(404).json({ message: "Deck introuvable" });
    }

    if (cardIndex < 0 || cardIndex >= deck.cards.length) {
      return res.status(400).json({ message: "Index de carte invalide" });
    }

    // Retirer la carte par index
    deck.cards.splice(cardIndex, 1);
    await deck.save();

    res.json(deck);
  } catch (err) {
    console.error("❌ Erreur suppression carte:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// 🟢 Modifier un deck (ex: rename)
export const updateDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Vérif : nom obligatoire
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Nom de deck requis" });
    }

    // Mise à jour uniquement du deck de l’utilisateur connecté
    const deck = await Deck.findOneAndUpdate(
      { _id: id, user: req.userId },
      { name: name.trim() },
      { new: true } // retourne la version mise à jour
    );

    if (!deck) {
      return res.status(404).json({ message: "Deck introuvable ou non autorisé" });
    }

    res.json(deck);
  } catch (err) {
    console.error("❌ Erreur update deck:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
