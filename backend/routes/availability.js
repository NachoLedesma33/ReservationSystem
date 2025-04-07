import express from "express";
import { getAvailableSlots } from "../controllers/availabilityController";

const router = express.Router();

router.get("/", getAvailableSlots);

export default router;
