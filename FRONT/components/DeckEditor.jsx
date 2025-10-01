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

  // ➕ Ajouter une carte
  const handleAddCard = async () => {
    if (!newCardName.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/decks/${deckId}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardName: newCardName.trim() }),
      });

      if (!res.ok) {
        console.error("Erreur API ajout carte:", await res.text());
        return;
      }

      const updatedDeck = await res.json();
      setDeck(updatedDeck);
      setNewCardName("");
    } catch (err) {
      console.error("Erreur ajout carte:", err);
    }
  };

  // ❌ Supprimer une carte
  const handleDeleteCard = async (index) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/decks/${deckId}/cards/${index}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Erreur API suppression carte:", await res.text());
        return;
      }

      const updatedDeck = await res.json();
      setDeck(updatedDeck);
    } catch (err) {
      console.error("Erreur suppression carte:", err);
    }
  };

  // 🔄 Persister un deck (rename, etc.)
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
      console.error("Erreur API persist deck:", await res.text());
      return;
    }

    const savedDeck = await res.json();
    setDeck(savedDeck);
  } catch (err) {
    console.error("Erreur persist deck:", err);
  }
};


  // ✏️ Renommer un deck
const handleRename = () => {
  if (!tempName.trim() || !deck) return;
  persistDeck({ name: tempName.trim() }); // ✅ tu passes juste le name
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
