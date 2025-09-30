"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../styles/DeckList.module.scss";

export default function DeckList() {
  const [decks, setDecks] = useState([]);
  const [newDeckName, setNewDeckName] = useState("");
  const [loading, setLoading] = useState(true);

  // Charger les decks depuis l'API
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("Pas de token trouvé, utilisateur non connecté");
          return;
        }

        const res = await fetch("http://localhost:4000/api/decks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Erreur API :", await res.text());
          return;
        }

        const data = await res.json();
        setDecks(data);
      } catch (err) {
        console.error("Erreur fetch decks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDecks();
  }, []);

  // Ajouter un deck
  const handleAddDeck = async () => {
    if (!newDeckName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newDeckName.trim() }),
      });

      if (!res.ok) {
        alert("Erreur lors de l’ajout du deck");
        return;
      }

      const createdDeck = await res.json();
      setDecks((prev) => [...prev, createdDeck]);
      setNewDeckName("");
    } catch (err) {
      console.error("Erreur ajout deck:", err);
    }
  };

  // Supprimer un deck
  const handleDeleteDeck = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/decks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("Erreur lors de la suppression du deck");
        return;
      }

      setDecks((prev) => prev.filter((deck) => deck._id !== id));
    } catch (err) {
      console.error("Erreur suppression deck:", err);
    }
  };

  if (loading) return <p>Chargement des decks...</p>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.addForm}>
        <input
          type="text"
          value={newDeckName}
          onChange={(e) => setNewDeckName(e.target.value)}
          placeholder="Name your deck"
        />
        <button onClick={handleAddDeck}>+ Add a deck</button>
      </div>

      <ul className={styles.list}>
        {decks.map((deck) => (
          <li key={deck._id} className={styles.item}>
            <button
              onClick={() => handleDeleteDeck(deck._id)}
              className={styles.deleteBtn}
              aria-label={`Supprimer ${deck.name}`}
              title={`Supprimer ${deck.name}`}
            >
              ❌
            </button>
            <Link href={`/decks/${deck._id}`} className={styles.link}>
              {deck.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
