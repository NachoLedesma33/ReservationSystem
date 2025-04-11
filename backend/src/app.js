import cors from "cors";
import dotenv from "dortenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import appointmentsRoutes from "./routes/appointments.js";
import authRoutes from "./routes/auth.js";
import availabilityRoutes from "./routes/availability.js";

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Configuración de variables de entorno
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({ path: envFile });

const app = express();

//Middleware
app.use(cors());
app.use(express.json());

//Usar rutas
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/availability", availabilityRoutes);

//Ruta básica
app.get("/", (req, res) => {
  res.send("API del Sistema de Reservas funcionando");
});

export default app;