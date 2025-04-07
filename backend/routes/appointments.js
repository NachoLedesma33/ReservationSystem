import express from "express";
import {
  getAllApointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController";
import { authenticacteToke, authorizeRole } from "../middleware/authMiddleware";

const router = express.Router();

//Rutas publicas
router.get("/vailable", (req, res) => {
  res.json({ message: "Horarios de citas disponibles" });
});

//Rotas protegidas
router.get("/", getAllApointments);
router.get("/:id", getAppointmentById);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

//Rutas de admin
router.get(
  "/admin/all",
  authenticacteToke,
  authorizeRole([`admin`]),
  getAllApointments
);

export default router;
