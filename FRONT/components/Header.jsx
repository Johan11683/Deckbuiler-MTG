"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/Header.module.scss";

export default function Header() {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const router = useRouter();

  const handleDisconnect = () => {
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <header className={styles.header}>
      {isLoggedIn && (
        <Link href="/decks" className={styles.link}>
          Decklists
        </Link>
      )}

      <h1 className={styles.title}>Deckbuilder MTG</h1>

      {isLoggedIn && (
        <button onClick={handleDisconnect} className={styles.button}>
          Disconnect
        </button>
      )}
    </header>
  );
}
