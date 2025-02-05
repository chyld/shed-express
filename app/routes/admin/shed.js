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

export default router;
