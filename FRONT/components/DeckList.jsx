"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../styles/DeckList.module.scss";

export default function DeckList() {
  const [decks, setDecks] = useState([]);
  const [newDeckName, setNewDeckName] = useState("");
  const [loaded, setLoaded] = useState(false); // ✅ évite d'écrire avant d'avoir lu

  // Charger depuis localStorage au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("decks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setDecks(parsed);
      }
    } catch (e) {
      console.error("Lecture localStorage échouée:", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Sauvegarder dès que decks change, mais seulement après le chargement initial
  useEffect(() => {
    if (!loaded) return; // ✅ garde-fou
    localStorage.setItem("decks", JSON.stringify(decks));
  }, [decks, loaded]);

  const handleAddDeck = () => {
    if (!newDeckName.trim()) return;
    const newDeck = {
      id: Date.now(),
      name: newDeckName.trim(),
      cards: [], // ✅ deck existe même sans cartes
    };
    setDecks((prev) => [...prev, newDeck]);
    setNewDeckName("");
  };

  const handleDeleteDeck = (id) => {
    setDecks((prev) => prev.filter((deck) => deck.id !== id));
  };

  return (
    <div className={styles?.wrapper || ""}>
      <div className={styles?.addForm || ""}>
        <input
          type="text"
          value={newDeckName}
          onChange={(e) => setNewDeckName(e.target.value)}
          placeholder="Nom du deck"
        />
        <button onClick={handleAddDeck}>+ Ajouter</button>
      </div>

      <ul className={styles?.list || ""} style={!styles ? { listStyle: "none", padding: 0 } : undefined}>
        {decks.map((deck) => (
          <li
            key={deck.id}
            className={styles?.item || ""}
            style={!styles ? { display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".5rem" } : undefined}
          >
            <button
              onClick={() => handleDeleteDeck(deck.id)}
              className={styles?.deleteBtn || ""}
              style={!styles ? { background: "transparent", border: "none", cursor: "pointer" } : undefined}
              aria-label={`Supprimer ${deck.name}`}
              title={`Supprimer ${deck.name}`}
            >
              ❌
            </button>
            <Link href={`/decks/${deck.id}`} className={styles?.link || ""}>
              {deck.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
