"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/AuthForm.module.scss";

export default function AuthForm() {
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ validation HTML5
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (password.length < 8) {
      alert("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }

    try {
      const endpoint = isSignup
        ? "http://localhost:4000/api/auth/signup"
        : "http://localhost:4000/api/auth/login";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Erreur");
        return;
      }

      if (isSignup) {
        alert("Compte créé, tu peux maintenant te connecter !");
        setIsSignup(false);
      } else {
        // ✅ Stocker le token JWT
        localStorage.setItem("token", data.token);

        setIsLoggedIn(true);
        router.push("/decks");
      }
    } catch (err) {
      console.error(err);
      alert("Impossible de joindre le serveur");
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <input
          type="email"
          placeholder="Email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe (min. 8)"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
        />
        <button type="submit" className={styles.button}>
          {isSignup ? "Créer un compte" : "Connexion"}
        </button>
      </form>

      <div className={styles.toggle}>
        {isSignup ? (
          <p>
            Déjà un compte ?{" "}
            <button
              type="button"
              onClick={() => setIsSignup(false)}
              className={styles.linkBtn}
            >
              Se connecter
            </button>
          </p>
        ) : (
          <p>
            Pas encore inscrit ?{" "}
            <button
              type="button"
              onClick={() => setIsSignup(true)}
              className={styles.linkBtn}
            >
              Créer un compte
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
