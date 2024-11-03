import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { hash, compare } from "../scrypt";
import { SigninSchema, SignupSchema } from "../types";
import prisma from "@repo/db/client";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
export const router = Router();

router.post("/signup", async (req, res) => {
  const parsedData = SignupSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({ message: "Invalid inputs" }).status(400);
  }
  try {
    if (!parsedData.data?.password || !parsedData.data.username) {
      res.json({ message: "Invalid inputs" }).status(200);
      return;
    }
    const userExists = await prisma.user.findUnique({
      where: { username: parsedData.data?.username },
    });
    if (userExists) {
      res.json({ message: "Username already exists" }).status(400);
      return;
    }
    const hashedPassword = await hash(parsedData.data?.password, 10);
    const user = await prisma.user.create({
      data: {
        username: parsedData.data?.username,
        password: hashedPassword,
        role: parsedData.data?.type || "Admin",
      },
    });
    res.json({ userId: user.id }).status(200);
  } catch (error) {
    res.json({ message: "Something went worng" }).status(400);
  }
});

router.post("/signin", async (req, res) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({ message: "Invalid inputs" }).status(400);
    return;
  }
  try {
    const userExists = await prisma.user.findUnique({
      where: { username: parsedData.data?.username },
    });
    if (!userExists) {
      res.json({ message: "Invalid username" }).status(400);
      return;
    }
    const isPasswordValid = await compare(
      parsedData.data?.password as string,
      userExists?.password
    );
    if (!isPasswordValid) {
      res.json({ message: "Inalid password" }).status(400);
    }
    const token = jwt.sign(
      { userId: userExists.id, type: userExists.role },
      JWT_PASSWORD
    );
    res.json({ token });
  } catch (e) {
    res.json({ message: "Inalid credentials" }).status(400);
  }
});

router.get("/elements", async (req, res) => {
  try {
    const elements = await prisma.element.findMany();
    res.json({ elements });
  } catch (error) {
    res.json({ message: "Inalid credentials" }).status(400);
  }
});
router.get("/avatars", async (req, res) => {
  try {
    const avatars = await prisma.avatar.findMany();
    res.json({ avatars });
  } catch (error) {
    res.json({ message: "Inalid credentials" }).status(400);
  }
});

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);
