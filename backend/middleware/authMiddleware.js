import jwt from "jsonwebtoken";

// Middleware to verify JWT token from Authorization header
export const verifyToken = (req, res, next) => {
  try {
    // Extract token from "Bearer <token>" header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Accesso negato: token mancante",
      });
    }

    // Split "Bearer <token>" and get token part
    const token = authHeader.split(" ")[1];

    // Verify token and decode payload (throws if invalid or expired)
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-this"
    );

    // Attach decoded user data to request object
    req.user = decoded;
    next();
  } catch (error) {
    // Handle specific token errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token scaduto" });
    }

    return res.status(401).json({ message: "Token non valido" });
  }
};
