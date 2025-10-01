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
      return res
        .status(404)
        .json({ message: "Deck introuvable ou non autorisé" });
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
      return res
        .status(404)
        .json({ message: "Deck introuvable ou non autorisé" });
    }

    res.json({ message: "Deck supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🟢 Ajouter une carte dans un deck (avec compteur)
export const addCardToDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const cardData = req.body;

    if (!cardData.name || !cardData.scryfallId) {
      return res
        .status(400)
        .json({ message: "Nom et ID Scryfall requis" });
    }

    const deck = await Deck.findOne({ _id: id, user: req.userId });
    if (!deck) {
      return res.status(404).json({ message: "Deck introuvable" });
    }

    // Vérifie si la carte est déjà présente
    const existingCard = deck.cards.find(
      (c) =>
        c.scryfallId === cardData.scryfallId ||
        c.name.toLowerCase() === cardData.name.toLowerCase()
    );

    if (existingCard) {
      existingCard.count = (existingCard.count || 1) + 1;
    } else {
      deck.cards.push({
        scryfallId: cardData.scryfallId,
        name: cardData.name,
        manaCost: cardData.manaCost || "",
        typeLine: cardData.typeLine || "",
        oracleText: cardData.oracleText || "",
        power: cardData.power || "",
        toughness: cardData.toughness || "",
        imageUrl: cardData.imageUrl || "",
        cmc: cardData.cmc || 0,
        count: 1,
      });
    }

    await deck.save();
    res.json(deck);
  } catch (err) {
    console.error("❌ Erreur ajout carte:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🟢 Supprimer une carte d’un deck (décrément ou suppression)
export const removeCardFromDeck = async (req, res) => {
  try {
    const { id, cardIndex } = req.params;
    const index = Number(cardIndex);

    const deck = await Deck.findOne({ _id: id, user: req.userId });
    if (!deck) {
      return res.status(404).json({ message: "Deck introuvable" });
    }

    if (Number.isNaN(index) || index < 0 || index >= deck.cards.length) {
      return res.status(400).json({ message: "Index de carte invalide" });
    }

    const card = deck.cards[index];
    if ((card.count || 1) > 1) {
      card.count -= 1;
    } else {
      deck.cards.splice(index, 1);
    }

    await deck.save();
    res.json(deck);
  } catch (err) {
    console.error("❌ Erreur suppression carte:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🟢 Modifier un deck (rename)
export const updateDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Nom de deck requis" });
    }

    const deck = await Deck.findOneAndUpdate(
      { _id: id, user: req.userId },
      { name: name.trim() },
      { new: true }
    );

    if (!deck) {
      return res
        .status(404)
        .json({ message: "Deck introuvable ou non autorisé" });
    }

    res.json(deck);
  } catch (err) {
    console.error("❌ Erreur update deck:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
