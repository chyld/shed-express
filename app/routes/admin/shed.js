import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to parse form data
const parseShedData = (body) => {
  const {
    title,
    description,
    inventoryNumber,
    shedType,
    sizeWidth,
    sizeLength,
    basePrice,
    optionsPrice,
    salePercent,
    colorRoof,
    colorSiding,
    colorTrim,
    isNew,
    isSold,
    isDeleted,
  } = body;

  return {
    title,
    description,
    inventoryNumber,
    shedType,
    sizeWidth: parseInt(sizeWidth),
    sizeLength: parseInt(sizeLength),
    basePrice: parseInt(basePrice),
    optionsPrice: parseInt(optionsPrice),
    salePercent: parseInt(salePercent),
    colorRoof,
    colorSiding,
    colorTrim,
    isNew: isNew === "on",
    isSold: isSold === "on",
    isDeleted: isDeleted === "on",
  };
};

// Helper function to create empty shed object
const createEmptyShed = () => ({
  title: "",
  description: "",
  inventoryNumber: "",
  shedType: "",
  sizeWidth: "",
  sizeLength: "",
  basePrice: "",
  optionsPrice: "",
  salePercent: 0,
  colorRoof: "",
  colorSiding: "",
  colorTrim: "",
  isNew: true,
  isSold: false,
  isDeleted: false,
});

// List all sheds
router.get("/", async (req, res) => {
  try {
    const sheds = await prisma.shed.findMany({
      include: {
        media: true,
      },
      orderBy: [
        { isDeleted: "asc" }, // Non-deleted items first
        { isSold: "asc" }, // Then non-sold items
        { createdAt: "desc" }, // Newest at the top
      ],
    });

    res.render("admin/shed", { sheds });
  } catch (error) {
    console.error("Error fetching sheds:", error);
    res.status(500).send("Error loading sheds");
  }
});

// Show new shed form
router.get("/new", async (req, res) => {
  try {
    res.render("admin/shed_edit", { shed: createEmptyShed() });
  } catch (error) {
    console.error("Error loading new shed form:", error);
    res.status(500).send("Error loading new shed form");
  }
});

// Create new shed
router.post("/new", async (req, res) => {
  try {
    await prisma.shed.create({
      data: parseShedData(req.body),
    });

    res.redirect("/admin/sheds");
  } catch (error) {
    console.error("Error creating shed:", error);
    res.status(500).send("Error creating shed");
  }
});

// Show edit form
router.get("/:id/edit", async (req, res) => {
  try {
    const shed = await prisma.shed.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!shed) {
      return res.status(404).send("Shed not found");
    }

    res.render("admin/shed_edit", { shed });
  } catch (error) {
    console.error("Error fetching shed:", error);
    res.status(500).send("Error loading shed");
  }
});

// Update shed
router.post("/:id", async (req, res) => {
  try {
    await prisma.shed.update({
      where: {
        id: req.params.id,
      },
      data: parseShedData(req.body),
    });

    res.redirect("/admin/sheds");
  } catch (error) {
    console.error("Error updating shed:", error);
    res.status(500).send("Error updating shed");
  }
});

export default router;
