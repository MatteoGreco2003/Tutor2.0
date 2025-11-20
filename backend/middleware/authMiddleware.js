import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("=== DEBUG MIDDLEWARE ===");
    console.log("Auth header ricevuto:", authHeader);
    console.log("Token da header:", authHeader?.split(" ")[1]);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Token mancante o formato sbagliato");
      return res.status(401).json({
        message: "Accesso negato: token mancante",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token completo:", token);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-this"
    );

    console.log("✅ Token verificato:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Errore verifica token:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token scaduto" });
    }

    return res.status(401).json({ message: "Token non valido" });
  }
};
