import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("public/home");
});

router.get("/sheds", (req, res) => {
  res.render("public/sheds");
});

router.get("/trailers", (req, res) => {
  res.render("public/trailers");
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
