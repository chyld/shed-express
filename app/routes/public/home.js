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

router.get("/sheds/:id", async (req, res) => {
  try {
    const shed = await prisma.shed.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        media: {
          where: {
            isDeleted: false,
          },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!shed) {
      return res.status(404).send("Shed not found");
    }

    res.render("public/shed_detail", { shed });
  } catch (error) {
    console.error("Error fetching shed details:", error);
    res.status(500).send("Error loading shed details");
  }
});

router.get("/trailers", async (req, res) => {
  try {
    const trailers = await prisma.trailer.findMany({
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

    res.render("public/trailers", { trailers });
  } catch (error) {
    console.error("Error fetching trailers:", error);
    res.status(500).send("Error loading trailers");
  }
});

router.get("/trailers/:id", async (req, res) => {
  try {
    const trailer = await prisma.trailer.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        media: {
          where: {
            isDeleted: false,
          },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!trailer) {
      return res.status(404).send("Trailer not found");
    }

    res.render("public/trailer_detail", { trailer });
  } catch (error) {
    console.error("Error fetching trailer details:", error);
    res.status(500).send("Error loading trailer details");
  }
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
