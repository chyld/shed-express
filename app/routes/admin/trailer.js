import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to parse form data
const parseTrailerData = (body) => {
  const {
    title,
    description,
    modelNumber,
    plateNumber,
    vin,
    trailerType,
    sizeWidth,
    sizeLength,
    price,
    salePercent,
    isNew,
    isSold,
    isDeleted,
  } = body;

  return {
    title,
    description,
    modelNumber,
    plateNumber,
    vin,
    trailerType,
    sizeWidth: parseInt(sizeWidth),
    sizeLength: parseInt(sizeLength),
    price: parseInt(price),
    salePercent: parseInt(salePercent),
    isNew: isNew === "on",
    isSold: isSold === "on",
    isDeleted: isDeleted === "on",
  };
};

// Helper function to create empty trailer object
const createEmptyTrailer = () => ({
  title: "",
  description: "",
  modelNumber: "",
  plateNumber: "",
  vin: "",
  trailerType: "",
  sizeWidth: "",
  sizeLength: "",
  price: "",
  salePercent: 0,
  isNew: true,
  isSold: false,
  isDeleted: false,
});

// List all trailers
router.get("/", async (req, res) => {
  try {
    const trailers = await prisma.trailer.findMany({
      include: {
        media: true,
      },
      orderBy: [
        { isDeleted: "asc" }, // Non-deleted items first
        { isSold: "asc" }, // Then non-sold items
        { createdAt: "desc" }, // Newest at the top
      ],
    });

    res.render("admin/trailer", { trailers });
  } catch (error) {
    console.error("Error fetching trailers:", error);
    res.status(500).send("Error loading trailers");
  }
});

// Show new trailer form
router.get("/new", async (req, res) => {
  try {
    res.render("admin/trailer_edit", { trailer: createEmptyTrailer() });
  } catch (error) {
    console.error("Error loading new trailer form:", error);
    res.status(500).send("Error loading new trailer form");
  }
});

// Create new trailer
router.post("/new", async (req, res) => {
  try {
    await prisma.trailer.create({
      data: parseTrailerData(req.body),
    });

    res.redirect("/admin/trailers");
  } catch (error) {
    console.error("Error creating trailer:", error);
    res.status(500).send("Error creating trailer");
  }
});

// Show edit form
router.get("/:id/edit", async (req, res) => {
  try {
    const trailer = await prisma.trailer.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        media: true,
      },
    });

    if (!trailer) {
      return res.status(404).send("Trailer not found");
    }

    res.render("admin/trailer_edit", { trailer });
  } catch (error) {
    console.error("Error fetching trailer:", error);
    res.status(500).send("Error loading trailer");
  }
});

// Update trailer
router.post("/:id", async (req, res) => {
  try {
    await prisma.trailer.update({
      where: {
        id: req.params.id,
      },
      data: parseTrailerData(req.body),
    });

    res.redirect("/admin/trailers");
  } catch (error) {
    console.error("Error updating trailer:", error);
    res.status(500).send("Error updating trailer");
  }
});

export default router;
