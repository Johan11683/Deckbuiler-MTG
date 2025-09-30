"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/AuthForm.module.scss";

export default function AuthForm() {
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    router.push("/decks");
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input type="text" placeholder="Identifiant" className={styles.input} />
      <input type="password" placeholder="Mot de passe" className={styles.input} />
      <button type="submit" className={styles.button}>Connexion</button>
    </form>
  );
}
