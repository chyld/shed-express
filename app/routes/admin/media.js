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

const upload = multer({ storage: storage });

// Get media page
router.get("/:type/:id", async (req, res) => {
  const { type, id } = req.params;

  try {
    let item;
    let media;

    if (type === "shed") {
      item = await prisma.shed.findUnique({
        where: { id },
        include: {
          media: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
      media = item?.media || [];
    } else if (type === "trailer") {
      item = await prisma.trailer.findUnique({
        where: { id },
        include: {
          media: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
      media = item?.media || [];
    }

    if (!item) {
      return res.status(404).send("Item not found");
    }

    res.render("admin/media/media", {
      item,
      media,
      type,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading media");
  }
});

// Upload new media
router.post("/:type/:id/upload", upload.single("media"), async (req, res) => {
  const { type, id } = req.params;
  const file = req.file;

  try {
    const mediaPath = "/media/" + file.filename;
    const isPhoto = file.mimetype.startsWith("image/");

    if (type === "shed") {
      await prisma.shedMedia.create({
        data: {
          path: mediaPath,
          isPhoto,
          shedId: id,
        },
      });
    } else if (type === "trailer") {
      await prisma.trailerMedia.create({
        data: {
          path: mediaPath,
          isPhoto,
          trailerId: id,
        },
      });
    }

    res.redirect(`/admin/media/${type}/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading media");
  }
});

// Delete media
router.post("/:type/:id/delete/:mediaId", async (req, res) => {
  const { type, id, mediaId } = req.params;

  try {
    if (type === "shed") {
      const media = await prisma.shedMedia.findUnique({
        where: { id: mediaId },
      });
      await prisma.shedMedia.update({
        where: { id: mediaId },
        data: {
          isDeleted: !media.isDeleted,
          // If we're setting isDeleted to true, then isPrimary should be false
          isPrimary: media.isDeleted ? media.isPrimary : false,
        },
      });
    } else if (type === "trailer") {
      const media = await prisma.trailerMedia.findUnique({
        where: { id: mediaId },
      });
      await prisma.trailerMedia.update({
        where: { id: mediaId },
        data: {
          isDeleted: !media.isDeleted,
          // If we're setting isDeleted to true, then isPrimary should be false
          isPrimary: media.isDeleted ? media.isPrimary : false,
        },
      });
    }

    res.redirect(`/admin/media/${type}/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error toggling media deletion status");
  }
});

// Toggle primary status
router.post("/:type/:id/primary/:mediaId", async (req, res) => {
  const { type, id, mediaId } = req.params;

  try {
    if (type === "shed") {
      // Start a transaction to ensure data consistency
      await prisma.$transaction(async (tx) => {
        // First, remove primary status from all media for this shed
        await tx.shedMedia.updateMany({
          where: {
            shedId: id,
            isPrimary: true,
          },
          data: { isPrimary: false },
        });

        // Get current media to check its status
        const media = await tx.shedMedia.findUnique({
          where: { id: mediaId },
        });

        // Only set to primary if it wasn't primary before
        if (!media.isPrimary) {
          await tx.shedMedia.update({
            where: { id: mediaId },
            data: { isPrimary: true },
          });
        }
      });
    } else if (type === "trailer") {
      await prisma.$transaction(async (tx) => {
        await tx.trailerMedia.updateMany({
          where: {
            trailerId: id,
            isPrimary: true,
          },
          data: { isPrimary: false },
        });

        const media = await tx.trailerMedia.findUnique({
          where: { id: mediaId },
        });

        if (!media.isPrimary) {
          await tx.trailerMedia.update({
            where: { id: mediaId },
            data: { isPrimary: true },
          });
        }
      });
    }

    res.redirect(`/admin/media/${type}/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error setting primary media");
  }
});

export default router;
