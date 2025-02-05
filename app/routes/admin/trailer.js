import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const trailers = await prisma.trailer.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.render("admin/trailer/trailer_list", { trailers });
  } catch (error) {
    console.error("Error fetching trailers:", error);
    res.status(500).render("error", { message: "Error loading trailers" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const trailer = await prisma.trailer.findFirst({
      where: {
        id: req.params.id,
        isDeleted: false,
      },
      include: {
        media: {
          where: {
            isDeleted: false,
          },
        },
      },
    });

    if (!trailer) {
      return res.status(404).render("error", { message: "Trailer not found" });
    }

    res.render("admin/trailer/trailer_detail", { trailer });
  } catch (error) {
    console.error("Error fetching trailer:", error);
    res
      .status(500)
      .render("error", { message: "Error loading trailer details" });
  }
});

export default router;
