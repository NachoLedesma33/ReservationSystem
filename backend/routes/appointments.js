import express from "express";
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = express.Router();

//Rutas publicas
router.get("/vailable", (req, res) => {
  res.json({ message: "Horarios de citas disponibles" });
});

//Rotas protegidas
router.get("/", getAllAppointments);
router.get("/:id", getAppointmentById);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

//Rutas de administrador
router.get(
  "/admin/all",
  authenticateToken,
  authorizeRole([`admin`]),
  getAllAppointments
);

export default router;
