"use client";
import { useEffect, useState } from "react";
import styles from "../styles/DeckEditor.module.scss";

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

  // === Ajouter une carte ===
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

  // === Supprimer une carte ===
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
        >
          ❌
        </button>
        <img
          src={card.imageUrl}
          alt={card.name}
          className={styles.cardPreview}
          onClick={() => setPreviewCard(card.imageUrl)}
        />
        {card.name}
      </li>
    ));

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
            <h2>{deck.name}</h2>
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
          <h3>Creatures</h3>
          <ul className={styles.cardList}>{renderCards(categories.creatures)}</ul>
          <h3>Lands</h3>
          <ul className={styles.cardList}>{renderCards(categories.lands)}</ul>
          <h3>Artifacts</h3>
          <ul className={styles.cardList}>{renderCards(categories.artifacts)}</ul>
        </div>

        {/* Colonne droite */}
        <div className={styles.cardColumn}>
          <h3>Sorceries</h3>
          <ul className={styles.cardList}>{renderCards(categories.sorceries)}</ul>
          <h3>Instants</h3>
          <ul className={styles.cardList}>{renderCards(categories.instants)}</ul>
          <h3>Enchantments</h3>
          <ul className={styles.cardList}>{renderCards(categories.enchants)}</ul>
        </div>
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
