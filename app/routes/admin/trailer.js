import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

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
    res.status(500).render("error", { message: "Error loading trailers" });
  }
});

export default router;
