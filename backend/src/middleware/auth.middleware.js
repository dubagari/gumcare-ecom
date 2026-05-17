import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token && token !== "null" && token !== "undefined") {
      return token;
    }
  }
  return req.cookies?.access_token;
};

export const verifyUser = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: "No token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export const verifyAdmin = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: "No token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
