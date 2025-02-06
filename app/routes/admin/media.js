import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../../public/media");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const randomHex = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, randomHex + ext);
  },
});

const upload = multer({ storage: storage }).array("media"); // No limit specified

// Get media page
router.get("/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  const modelName = type === "shed" ? "shed" : "trailer";

  try {
    const item = await prisma[modelName].findUnique({
      where: { id },
      include: {
        media: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!item) {
      return res.status(404).send("Item not found");
    }

    res.render("admin/media", {
      item,
      media: item.media || [],
      type,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading media");
  }
});

// Upload new media
router.post("/:type/:id/upload", upload, async (req, res) => {
  const { type, id } = req.params;
  const files = req.files;

  try {
    const modelName = type === "shed" ? "shedMedia" : "trailerMedia";
    const relationField = type === "shed" ? "shedId" : "trailerId";

    // Create media entries for all uploaded files
    await Promise.all(
      files.map((file) =>
        prisma[modelName].create({
          data: {
            path: "/media/" + file.filename,
            isPhoto: file.mimetype.startsWith("image/"),
            [relationField]: id,
          },
        }),
      ),
    );

    res.redirect(`/admin/media/${type}/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading media");
  }
});

// Delete media
router.post("/:type/:id/delete/:mediaId", async (req, res) => {
  const { type, id, mediaId } = req.params;
  const modelName = type === "shed" ? "shedMedia" : "trailerMedia";

  try {
    const media = await prisma[modelName].findUnique({
      where: { id: mediaId },
    });

    await prisma[modelName].update({
      where: { id: mediaId },
      data: {
        isDeleted: !media.isDeleted,
        isPrimary: media.isDeleted ? media.isPrimary : false,
      },
    });

    res.redirect(`/admin/media/${type}/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error toggling media deletion status");
  }
});

// Toggle primary status
router.post("/:type/:id/primary/:mediaId", async (req, res) => {
  const { type, id, mediaId } = req.params;
  const modelName = type === "shed" ? "shedMedia" : "trailerMedia";
  const relationField = type === "shed" ? "shedId" : "trailerId";

  try {
    await prisma.$transaction(async (tx) => {
      // Get current media to check its status
      const media = await tx[modelName].findUnique({
        where: { id: mediaId },
      });

      if (media.isPrimary) {
        // If it's primary, just remove its primary status
        await tx[modelName].update({
          where: { id: mediaId },
          data: { isPrimary: false },
        });
      } else {
        // If it's not primary, remove other primaries and set this one
        await tx[modelName].updateMany({
          where: {
            [relationField]: id,
            isPrimary: true,
          },
          data: { isPrimary: false },
        });

        await tx[modelName].update({
          where: { id: mediaId },
          data: { isPrimary: true },
        });
      }
    });

    res.redirect(`/admin/media/${type}/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error setting primary media");
  }
});

export default router;
