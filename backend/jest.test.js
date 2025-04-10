import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import fs from "fs";

// Configurar variables de entorno para tests
dotenv.config({ path: ".env.test" });

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Asegurarse de que exista la carpeta de tests
const testDbDir = resolve(__dirname, "src/db/test");
if (!fs.existsSync(testDbDir)) {
  fs.mkdirSync(testDbDir, { recursive: true });
}

// Crear un archivo .env.test para los tests
if (!fs.existsSync(".env.test")) {
  fs.writeFileSync(
    ".env.test",
    "PORT=3001\nJWT_SECRET=test_secret\nNODE_ENV=test"
  );
}
