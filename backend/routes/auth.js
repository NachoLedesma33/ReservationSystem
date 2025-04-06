import express from "express";

const router = express.Router();

router.post("/register", (req, res) => {
  res.json({ message: "Registro exitoso" });
});

router.post("/login", (req, res) => {
  res.json({ message: "Login exitoso" });
});

export default router;
