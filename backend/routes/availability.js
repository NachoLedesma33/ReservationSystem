import express from "express";
import { getAvailableSlots } from "../controllers/availablilityController.js";

const router = express.Router();

router.get("/", getAvailableSlots);

export default router;
