import express from "express";

const router = express.Router();

// 🔎 Autocomplete (renvoie 5 propositions max)
router.get("/autocomplete", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Paramètre q requis" });

    const response = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(q)}`);
    const data = await response.json();

    res.json(data.data.slice(0, 5)); // max 5 suggestions
  } catch (err) {
    console.error("Erreur autocomplete:", err);
    res.status(500).json({ message: "Erreur serveur Scryfall" });
  }
});

// 📄 Récupérer les détails complets d'une carte
router.get("/named", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "Paramètre name requis" });

    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`);
    const data = await response.json();

    // On simplifie un peu avant de stocker
    const card = {
      scryfallId: data.id,
      name: data.name,
      manaCost: data.mana_cost,
      typeLine: data.type_line,
      oracleText: data.oracle_text,
      power: data.power,
      toughness: data.toughness,
      colors: data.colors,
      imageUrl: data.image_uris?.normal || null,
      rarity: data.rarity,
      setName: data.set_name,
      cmc: data.cmc
    };

    res.json(card);
  } catch (err) {
    console.error("Erreur fetch named:", err);
    res.status(500).json({ message: "Erreur serveur Scryfall" });
  }
});

export default router;
