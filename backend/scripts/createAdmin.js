import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = resolve(__dirname, "../db/reservas.db");
const db = new sqlite3.Database(dbPath);

async function createAdmin() {
  try {
    // Datos del administrador
    const admin = {
      name: "Admin",
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
    };

    // Verifico si ya existe
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [admin.email],
      (err, user) => {
        if (err) {
          console.error("Error al verificar admin:", err.message);
          db.close();
          return;
        }

        if (user) {
          console.log("El administrador ya existe");
          db.close();
          return;
        }

        // Inserto el administrador
        const sql =
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
        db.run(
          sql,
          [admin.name, admin.email, admin.password, admin.role],
          function (err) {
            if (err) {
              console.error("Error al crear admin:", err.message);
            } else {
              console.log("Administrador creado con éxito. ID:", this.lastID);
            }
            db.close();
          }
        );
      }
    );
  } catch (error) {
    console.error("Error:", error);
    db.close();
  }
}

createAdmin();
