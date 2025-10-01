"use client";
import { useEffect, useState } from "react";
import styles from "../styles/DeckEditor.module.scss";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DeckEditor({ deckId }) {
  const [deck, setDeck] = useState(null);
  const [newCardName, setNewCardName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [previewCard, setPreviewCard] = useState(null);

  // === Charger le deck ===
  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`http://localhost:4000/api/decks/${deckId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Erreur API:", await res.text());
          return;
        }

        const data = await res.json();
        setDeck(data);
        setTempName(data.name);
      } catch (err) {
        console.error("Erreur fetch deck:", err);
      }
    };

    fetchDeck();
  }, [deckId]);

  // === Autocomplete Scryfall ===
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!newCardName.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `http://localhost:4000/api/cards/autocomplete?q=${encodeURIComponent(
            newCardName
          )}`
        );
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data || []);
      } catch (err) {
        console.error("Erreur autocomplete:", err);
      }
    };

    const timeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeout);
  }, [newCardName]);

  // === Ajouter une carte (ou incrémenter si existe) ===
  const handleSelectSuggestion = async (cardName) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:4000/api/cards/named?name=${encodeURIComponent(
          cardName
        )}`
      );

      if (!res.ok) {
        console.error("Erreur API détails carte:", await res.text());
        return;
      }

      const cardData = await res.json();

        const cardPayload = {
            name: cardData.name,
            scryfallId: cardData.scryfallId || "",
            imageUrl: cardData.imageUrl || "",
            manaCost: cardData.manaCost || "",
            typeLine: cardData.typeLine || "",
            oracleText: cardData.oracleText || "",
            cmc: cardData.cmc || 0,
            power: cardData.power || "",
            toughness: cardData.toughness || "",
        };


      if (!cardPayload.name) {
        console.error("⚠️ Pas de nom dans cardPayload, abort");
        return;
      }

      const addRes = await fetch(
        `http://localhost:4000/api/decks/${deckId}/cards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cardPayload),
        }
      );

      if (!addRes.ok) {
        console.error("Erreur API ajout carte:", await addRes.text());
        return;
      }

      const updatedDeck = await addRes.json();
      setDeck(updatedDeck);
      setNewCardName("");
      setSuggestions([]);
    } catch (err) {
      console.error("Erreur ajout carte:", err);
    }
  };

  // === Supprimer ou décrémenter ===
  const handleDeleteCard = async (index) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:4000/api/decks/${deckId}/cards/${index}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok)
        return console.error("Erreur API suppression:", await res.text());
      const updatedDeck = await res.json();
      setDeck(updatedDeck);
    } catch (err) {
      console.error("Erreur suppression carte:", err);
    }
  };

  // === Dupliquer (incrémente count) ===
  const handleDuplicateCard = async (card) => {
    try {
      const token = localStorage.getItem("token");
      const cardPayload = {
        name: card.name,
        scryfallId: card.scryfallId || "",
        imageUrl: card.imageUrl || "",
        manaCost: card.manaCost || "",
        typeLine: card.typeLine || "",
        oracleText: card.oracleText || "",
        cmc: card.cmc || 0,
      };

      const addRes = await fetch(
        `http://localhost:4000/api/decks/${deckId}/cards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cardPayload),
        }
      );

      if (!addRes.ok) {
        console.error("Erreur API duplication:", await addRes.text());
        return;
      }

      const updatedDeck = await addRes.json();
      setDeck(updatedDeck);
    } catch (err) {
      console.error("Erreur duplication carte:", err);
    }
  };

  // === Rename deck ===
  const persistDeck = async (updated) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/decks/${deckId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });
      if (!res.ok) return console.error("Erreur API persist:", await res.text());
      const saved = await res.json();
      setDeck(saved);
    } catch (err) {
      console.error("Erreur persist deck:", err);
    }
  };

  const handleRename = () => {
    if (!tempName.trim() || !deck) return;
    persistDeck({ name: tempName.trim() });
    setIsEditingName(false);
  };

  if (!deck) return <p>Deck introuvable</p>;

  // === Catégorisation avec priorité (évite doublons) ===
  const categories = {
    creatures: [],
    lands: [],
    artifacts: [],
    sorceries: [],
    instants: [],
    enchants: [],
  };

  deck.cards.forEach((c, i) => {
    const type = c.typeLine?.toLowerCase() || "";

    if (type.includes("creature")) {
      categories.creatures.push({ ...c, index: i });
    } else if (type.includes("land")) {
      categories.lands.push({ ...c, index: i });
    } else if (type.includes("artifact")) {
      categories.artifacts.push({ ...c, index: i });
    } else if (type.includes("sorcery")) {
      categories.sorceries.push({ ...c, index: i });
    } else if (type.includes("instant")) {
      categories.instants.push({ ...c, index: i });
    } else if (type.includes("enchantment")) {
      categories.enchants.push({ ...c, index: i });
    }
  });

  const renderCards = (cards) =>
    cards.map((card) => (
      <li key={card.scryfallId || card.index} className={styles.cardItem}>
        <button
          className={styles.deleteBtn}
          onClick={() => handleDeleteCard(card.index)}
          title="Supprimer"
        >
          ❌
        </button>
        <button
          className={styles.duplicateBtn}
          onClick={() => handleDuplicateCard(card)}
          title="Ajouter un exemplaire"
        >
          ➕
        </button>
        <img
          src={card.imageUrl}
          alt={card.name}
          className={styles.cardPreview}
          onClick={() => setPreviewCard(card.imageUrl)}
        />
        {card.name} <span className={styles.count}>x{card.count || 1}</span>
      </li>
    ));

  // ✅ Total = somme des counts
  const totalCount = deck.cards.reduce((sum, c) => sum + (c.count || 1), 0);

  return (
    <div className={styles.editor}>
      {/* Header */}
      <div className={styles.headerRow}>
        {isEditingName ? (
          <>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className={styles.inputRename}
            />
            <button onClick={handleRename} className={styles.saveBtn}>
              ✅
            </button>
            <button
              onClick={() => setIsEditingName(false)}
              className={styles.cancelBtn}
            >
              ❌
            </button>
          </>
        ) : (
          <>
            <h2>
              {deck.name}{" "}
              <span className={styles.deckCount}>({totalCount}/100)</span>
            </h2>
            <button
              onClick={() => setIsEditingName(true)}
              className={styles.editBtn}
            >
              ✏️
            </button>
          </>
        )}
      </div>

      {/* Formulaire d’ajout */}
      <div className={styles.addForm}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={newCardName}
            onChange={(e) => setNewCardName(e.target.value)}
            placeholder="Card Name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (suggestions.length > 0) {
                  handleSelectSuggestion(suggestions[0]);
                }
              }
            }}
          />
          {suggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => handleSelectSuggestion(s)}
                  className={styles.suggestionItem}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={() => {
            if (suggestions.length > 0) {
              handleSelectSuggestion(suggestions[0]);
            }
          }}
          className={styles.addBtn}
        >
          + Add a card
        </button>
      </div>

      {/* Colonnes */}
      <div className={styles.cardColumns}>
        {/* Colonne gauche */}
        <div className={styles.cardColumn}>
          <h3>Creatures ({categories.creatures.length})</h3>
          <ul className={styles.cardList}>{renderCards(categories.creatures)}</ul>
          <h3>Lands ({categories.lands.length})</h3>
          <ul className={styles.cardList}>{renderCards(categories.lands)}</ul>
          <h3>Artifacts ({categories.artifacts.length})</h3>
          <ul className={styles.cardList}>{renderCards(categories.artifacts)}</ul>
        </div>

        {/* Colonne droite */}
        <div className={styles.cardColumn}>
          <h3>Sorceries ({categories.sorceries.length})</h3>
          <ul className={styles.cardList}>{renderCards(categories.sorceries)}</ul>
          <h3>Instants ({categories.instants.length})</h3>
          <ul className={styles.cardList}>{renderCards(categories.instants)}</ul>
          <h3>Enchantments ({categories.enchants.length})</h3>
          <ul className={styles.cardList}>{renderCards(categories.enchants)}</ul>
        </div>
      </div>

      {/* Mana Curve */}
      <div style={{ width: "100%", height: 250 }}>
        <h3>Mana Curve</h3>
        <ResponsiveContainer>
          <BarChart data={getManaCurveData(deck.cards)}>
            <XAxis dataKey="cmc" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Modale */}
      {previewCard && (
        <div
          className={styles.modalOverlay}
          onClick={() => setPreviewCard(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewCard} alt="Aperçu carte" />
          </div>
        </div>
      )}
    </div>
  );
}

// === Fonction mana curve ===
const getManaCurveData = (cards) => {
  const counts = {};
  cards.forEach((c) => {
    const cmc = c.cmc || 0;
    const key = cmc >= 7 ? "7+" : cmc;
    counts[key] = (counts[key] || 0) + (c.count || 1);
  });

  return Object.keys(counts)
    .sort((a, b) => (a === "7+" ? 999 : a) - (b === "7+" ? 999 : b))
    .map((key) => ({
      cmc: key,
      count: counts[key],
    }));
};
