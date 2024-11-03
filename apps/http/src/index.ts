import express from "express";
import { router } from "./routes/index";
import prisma from "@repo/db/client";
const PORT = process.env.POST || 3000;
const app = express();
app.use(express.json());
app.use("/api", router);

app.listen(PORT, () => console.log("Listening on PORT : " + PORT));
