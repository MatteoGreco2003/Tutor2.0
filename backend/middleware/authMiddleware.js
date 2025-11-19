import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    // Prendi il token dall'header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Accesso negato: token mancante",
      });
    }

    // Estrai il token (formato: "Bearer TOKEN")
    const token = authHeader.split(" ")[1];

    // Verifica il token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Salva l'utente nella richiesta per usarlo dopo
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Errore verifica token:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token scaduto",
      });
    }

    return res.status(401).json({
      message: "Token non valido",
    });
  }
};
