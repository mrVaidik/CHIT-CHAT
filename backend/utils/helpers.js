import jwt from "jsonwebtoken";

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || "default-secret-change-in-production",
  expiresIn: process.env.JWT_EXPIRES_IN || "24h",
};

export const generateToken = (userId) => {
  if (!JWT_CONFIG.secret) {
    throw new Error("JWT secret is not configured");
  }

  return jwt.sign({ userId }, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
  });
};

export const formatTime = (timestamp) => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid timestamp");
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Time formatting error:", error);
    return "Invalid time";
  }
};
