import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const sheds = await prisma.shed.findMany({
      orderBy: [
        { isDeleted: "asc" }, // Non-deleted items first
        { isSold: "asc" }, // Then non-sold items
        { createdAt: "desc" }, // Newest at the top
      ],
    });

    res.render("admin/shed/shed_list", { sheds });
  } catch (error) {
    console.error("Error fetching sheds:", error);
    res.status(500).render("error", { message: "Error loading sheds" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const shed = await prisma.shed.findFirst({
      where: {
        id: req.params.id,
      },
      include: {
        media: {},
      },
    });

    if (!shed) {
      return res.status(404).render("error", { message: "Shed not found" });
    }

    res.render("admin/shed/shed_detail", { shed });
  } catch (error) {
    console.error("Error fetching shed:", error);
    res.status(500).render("error", { message: "Error loading shed details" });
  }
});

export default router;
