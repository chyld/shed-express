import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  res.render("home");
});

export default router;
