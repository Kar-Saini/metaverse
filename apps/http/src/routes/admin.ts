import { json, Response, Request, Router, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
import { CreateElementSchema } from "../types";
import { ParseStatus } from "zod";
import prisma from "@repo/db/client";
export const adminRouter = Router();

adminRouter.post("/element", (req, res) => {});
adminRouter.put("/element/:elementId", (req, res) => {});
adminRouter.post("/avatar", (req, res) => {});
adminRouter.post("/map", (req, res) => {});
