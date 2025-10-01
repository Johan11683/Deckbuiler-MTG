"use client";
import { useEffect, useState } from "react";
import styles from "../styles/DeckEditor.module.scss";

export default function DeckEditor({ deckId }) {
  const [deck, setDeck] = useState(null);
  const [newCardName, setNewCardName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

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
        console.log("✅ Réponse brute de l’API:", data);

        // On stocke directement le tableau de strings
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

      // Récupérer la carte complète depuis ton backend proxy
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
      console.log("🃏 Carte récupérée:", cardData);

      // ⚡ Normalisation stricte : payload attendu par ton back
      const cardPayload = {
        name: cardData.name, // requis
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

      // POST au backend
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
            placeholder="Nom de la carte"
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

      {/* Liste des cartes */}
      {deck.cards.length === 0 ? (
        <p>Aucune carte pour l’instant</p>
      ) : (
        <ul className={styles.cardList}>
          {deck.cards.map((card, i) => (
            <li key={card.scryfallId || i} className={styles.cardItem}>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDeleteCard(i)}
              >
                ❌
              </button>
              <img src={card.imageUrl} alt={card.name} width={50} /> {card.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
