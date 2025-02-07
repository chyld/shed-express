import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", (req, res) => {
  res.render("public/home");
});

router.get("/sheds", async (req, res) => {
  try {
    const sheds = await prisma.shed.findMany({
      where: {
        isDeleted: false,
        isSold: false,
      },
      include: {
        media: {
          where: {
            isPrimary: true,
            isDeleted: false,
          },
        },
      },
      orderBy: [
        { sizeWidth: "asc" },
        { sizeLength: "asc" },
        { createdAt: "desc" },
      ],
    });

    res.render("public/sheds", { sheds });
  } catch (error) {
    console.error("Error fetching sheds:", error);
    res.status(500).send("Error loading sheds");
  }
});

router.get("/trailers", (req, res) => {
  res.render("public/trailers");
});

router.get("/metal-buildings", (req, res) => {
  res.render("public/metal-buildings");
});

router.get("/play-sets", (req, res) => {
  res.render("public/play-sets");
});

router.get("/contact", (req, res) => {
  res.render("public/contact");
});

router.get("/about", (req, res) => {
  res.render("public/about");
});

export default router;
