import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Pas de token" });

  const token = authHeader.split(" ")[1];
console.log("📩 Token reçu du client:", token);

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log("✅ Token décodé:", decoded);
  req.userId = decoded.userId;
  next();
} catch (err) {
  console.error("❌ Erreur vérif JWT:", err.message);
  return res.status(403).json({ message: "Token invalide ou expiré" });
}

};
