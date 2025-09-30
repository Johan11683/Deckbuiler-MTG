import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ⚙️ Variables d'environnement avec fallback
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

// 🚨 Vérif mais sans throw
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ Attention : JWT_SECRET n’est pas défini dans ton .env. Utilisation du fallback_secret !");
} else {
  console.log("🔑 JWT_SECRET chargé : OK");
}

// 🟢 Signup
export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Email invalide" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Mot de passe trop court" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Utilisateur déjà existant" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "Utilisateur créé !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🟢 Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Générer un JWT
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log("🎟️ Token généré pour", email, ":", token);

    res.json({ message: "Connexion réussie !", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🟢 /me
export const me = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token manquant" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

// 🟢 Liste des users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("email createdAt");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🟢 Supprimer un user par email
export const deleteUser = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOneAndDelete({ email });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.json({ message: `Utilisateur ${email} supprimé avec succès` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
