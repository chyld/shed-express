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
            where: { isDeleted: false },
          },
        },
      });
      media = item?.media || [];
    } else if (type === "trailer") {
      item = await prisma.trailer.findUnique({
        where: { id },
        include: {
          media: {
            where: { isDeleted: false },
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
      await prisma.shedMedia.update({
        where: { id: mediaId },
        data: { isDeleted: true },
      });
    } else if (type === "trailer") {
      await prisma.trailerMedia.update({
        where: { id: mediaId },
        data: { isDeleted: true },
      });
    }

    res.redirect(`/admin/media/${type}/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting media");
  }
});

export default router;
