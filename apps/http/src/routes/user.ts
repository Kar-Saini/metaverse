import { Router } from "express";
import { UpdateMetadataSchema } from "../types";
import userMiddleware from "../midleware/user";
import prisma from "@repo/db/client";

export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
  const parsedData = UpdateMetadataSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({ message: "Invalid data" }).status(400);
    return;
  }
  try {
    await prisma.user.update({
      where: { id: req.userId },
      data: { avatarId: req.body.avatarId },
    });
    res.json({ message: "Metadata updated" });
  } catch (error) {
    res.json({ message: "Invalid inputs" }).status(400);
  }
});

userRouter.get("/metadata/bulk", async (req, res) => {
  const ids: string = req.query.ids as string;
  const idArr = ids.substring(1, ids.length - 2).split(",");

  const metaData = await prisma.user.findMany({
    where: {
      id: {
        in: idArr,
      },
    },
    select: {
      avatar: true,
      id: true,
    },
  });

  res.json({
    avatars: metaData.map((item) => {
      return {
        userId: item.avatar?.id,
        imageUrl: item.avatar?.imageUrl,
        name: item.avatar?.name,
      };
    }),
  });
});
