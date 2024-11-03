import { Response, Request, Router, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";

export default function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const authToken = authHeader && authHeader.split(" ")[1];

  if (!authToken) {
    return res.status(403).json({ message: "Unauthenticated" });
  }
  try {
    const decoded = jwt.verify(authToken, JWT_PASSWORD) as {
      role: string;
      userId: string;
    };
    if (decoded.role === "Admin") {
      req.userId = decoded.userId;
      next();
    }
  } catch (error) {
    res.json({ message: "Unauthorized" }).status(403);
  }
}
