import { Router } from "express";
import {
  AddElementSchema,
  CreateSpaceSchema,
  DeleteElementSchema,
} from "../types";
import prisma from "@repo/db/client";
import userMiddleware from "../midleware/user";

export const spaceRouter = Router();
spaceRouter.post("/", userMiddleware, async (req, res) => {
  const parsedData = CreateSpaceSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({ message: "Invalid inputs" }).status(400);
    return;
  }
  if (!parsedData.data.mapId) {
    const space = await prisma.space.create({
      data: {
        creatorId: req.userId,
        name: parsedData.data.name,
        width: Number(parsedData.data.dimensions.split("x")[0]),
        height: Number(parsedData.data.dimensions.split("x")[1]),
      },
    });
    res.json({ spaceId: space.id });
  }
  const map = await prisma.map.findUnique({
    where: { id: parsedData.data.mapId },
    include: { mapElements: true },
  });
  const mapElements = await prisma.mapElement.findMany({
    where: { mapId: parsedData.data.mapId },
    include: { element: true },
  });
  if (!map) {
    res.json({ message: "Map ID is invalid" }).status(403);
    return;
  }

  const spaceCreated = await prisma.$transaction(async () => {
    const space = await prisma.space.create({
      data: {
        creatorId: req.userId,
        name: parsedData.data.name,
        width: map.width,
        height: map.height,
      },
    });

    await prisma.spaceElement.createMany({
      data: map.mapElements.map((item) => ({
        elementId: item.id,
        spaceId: space.id,
      })),
    });
    return space;
  });
  res.json({ spaceId: spaceCreated.id });
});
spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
  const spaceId = req.params.spaceId;
  if (!spaceId) {
    res.json({ message: "No space id" }).status(403);
    return;
  }
  const space = await prisma.space.findUnique({ where: { id: spaceId } });
  if (!space) {
    res.json({ message: "Invalid space ID" }).status(403);
    return;
  }
  if (space.creatorId === req.userId) {
    await prisma.space.delete({ where: { id: spaceId } });
    res.json({ message: "Space deleted" }).status(200);
  } else {
    res.json({ message: "Creadtor Id and user ID and dfferent" }).status(403);
    return;
  }
});
spaceRouter.get("/all", userMiddleware, async (req, res) => {
  const spaces = await prisma.space.findMany({
    where: { creatorId: req.userId },
  });
  if (!spaces) {
    res.json({ message: "No spaces found" }).status(400);
    return;
  }
  res.json({
    spaces: spaces.map((item) => {
      return {
        id: item.id,
        name: item.name,
        thumbnail: item.thumbnail,
        dimension: `${item.width}x${item.height}`,
      };
    }),
  });
});
spaceRouter.get("/:spaceId", userMiddleware, async (req, res) => {
  const spaceId = req.params.spaceId;
  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    include: { spaceElements: { include: { element: true } }, creator: true },
  });
  if (!space) {
    res.json({ message: "No spaces found" }).status(400);
    return;
  }
  res.json({
    space: {
      creatorId: space.creatorId,
      dimensions: `${space.width}x${space.height}`,
      spaceElements: space.spaceElements.map((element) => ({
        id: element.id,
        element: {
          id: element.element.id,
          imageUrl: element.element.imageUrl,
          static: element.element.static,
          height: element.element.height,
          width: element.element.width,
        },
        x: element.x,
        y: element.y,
      })),
    },
  });
});
spaceRouter.post("/element", userMiddleware, async (req, res) => {
  const parsedData = AddElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({ message: "Invalid inputs" }).status(400);
    return;
  }
  const space = await prisma.space.findUnique({
    where: { id: parsedData.data.spaceId, creatorId: req.userId },
  });
  if (!space) {
    res.json({ message: "Invalid space ID or invalid creator ID" }).status(400);
    return;
  }
  const newSpaceElement = await prisma.spaceElement.create({
    data: {
      elementId: parsedData.data.elementId,
      spaceId: space.id,
      x: parsedData.data.x,
      y: parsedData.data.y,
    },
  });
  res.json({
    message: "Element added in space",
    spaceElementId: newSpaceElement.id,
  });
});
spaceRouter.delete("/element", userMiddleware, async (req, res) => {
  const parsedData = DeleteElementSchema.safeParse(req.body);
  const spaceElement = await prisma.spaceElement.findUnique({
    where: {
      id: parsedData.data?.id,
    },
  });
  if (!spaceElement) {
    res.json({ message: "Invalid space element ID" }).status(400);
    return;
  }
  const space = await prisma.space.findUnique({
    where: { id: spaceElement.spaceId },
  });

  if (!space) {
    res.json({ message: "Invalid space ID for the element" }).status(400);
    return;
  }
  if (space.creatorId !== req.userId) {
    res.json({ message: "Invalid user ID for the space" }).status(400);
    return;
  }
  await prisma.spaceElement.delete({ where: { id: parsedData.data?.id } });
  res.json({ message: "Space element deleted" });
});
