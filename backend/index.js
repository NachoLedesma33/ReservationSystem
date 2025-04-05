import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileRLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API del Sistema de Reservas funcionando");
});

app.listen(PORT, () => {
  console.log(`Server corriendo en puerto${PORT}`);
});
