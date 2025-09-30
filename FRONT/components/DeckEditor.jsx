"use client";
import { useEffect, useState } from "react";
import styles from "../styles/DeckEditor.module.scss";

export default function DeckEditor({ deckId }) {
  const [deck, setDeck] = useState(null);
  const [newCardName, setNewCardName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // Charger le deck depuis l’API
  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`http://localhost:4000/api/decks/${deckId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // Persister le deck via PATCH
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

      if (!res.ok) {
        console.error("Erreur API:", await res.text());
        return;
      }

      const saved = await res.json();
      setDeck(saved);
    } catch (err) {
      console.error("Erreur sauvegarde deck:", err);
    }
  };

  const handleAddCard = () => {
    if (!deck || !newCardName.trim()) return;
    const updated = { ...deck, cards: [...deck.cards, newCardName.trim()] };
    persistDeck(updated);
    setNewCardName("");
  };

  const handleDeleteCard = (index) => {
    if (!deck) return;
    const updated = { ...deck, cards: deck.cards.filter((_, i) => i !== index) };
    persistDeck(updated);
  };

  const handleRename = () => {
    if (!tempName.trim() || !deck) return;
    const updated = { ...deck, name: tempName.trim() };
    persistDeck(updated);
    setIsEditingName(false);
  };

  if (!deck) return <p>Deck introuvable</p>;

  return (
    <div className={styles.editor}>
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
            <button onClick={() => setIsEditingName(false)} className={styles.cancelBtn}>
              ❌
            </button>
          </>
        ) : (
          <>
            <h2>{deck.name}</h2>
            <button onClick={() => setIsEditingName(true)} className={styles.editBtn}>
              ✏️
            </button>
          </>
        )}
      </div>

      {/* Formulaire d’ajout de carte */}
      <div className={styles.addForm}>
        <input
          type="text"
          value={newCardName}
          onChange={(e) => setNewCardName(e.target.value)}
          placeholder="Nom de la carte"
        />
        <button onClick={handleAddCard}>+ Add a card</button>
      </div>

      {deck.cards.length === 0 ? (
        <p>Aucune carte pour l’instant</p>
      ) : (
        <ul className={styles.cardList}>
          {deck.cards.map((card, i) => (
            <li key={`${card}-${i}`} className={styles.cardItem}>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDeleteCard(i)}
              >
                ❌
              </button>
              {card}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
