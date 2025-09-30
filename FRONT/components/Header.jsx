"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/Header.module.scss";

export default function Header() {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleDisconnect = () => {
    setIsLoggedIn(false);
    router.push("/");
  };

  const isLoginPage = pathname === "/";

  return (
    <header className={styles.header}>
      <div className={styles.side}>
        {isLoggedIn ? (
          <Link
            href={isLoginPage ? "#" : "/decks"}
            className={`${styles.link} ${isLoginPage ? styles.disabled : ""}`}
            aria-disabled={isLoginPage}
          >
            Decklists
          </Link>
        ) : (
          <span className={styles.placeholder}>Decklists</span>
        )}
      </div>

      <h1 className={styles.title}>Deckbuilder MTG</h1>

      <div className={styles.side}>
        {isLoggedIn ? (
          <button
            onClick={isLoginPage ? undefined : handleDisconnect}
            className={`${styles.button} ${isLoginPage ? styles.disabled : ""}`}
            disabled={isLoginPage}
          >
            Disconnect
          </button>
        ) : (
          <span className={styles.placeholder}>Disconnect</span>
        )}
      </div>
    </header>
  );
}
