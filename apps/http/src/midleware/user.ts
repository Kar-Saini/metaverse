import { Response, Request, NextFunction } from "express";
import { JWT_PASSWORD } from "../config";
import jwt from "jsonwebtoken";

export default function userMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.json({ message: "Unatuhentixated" }).status(403);
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_PASSWORD) as {
      userId: string;
      role: "Admin" | "User";
    };
    req.userId = decoded.userId;
  } catch (error) {
    res.json({ message: "No token found" }).json(403);
  }
}
