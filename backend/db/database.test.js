import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Usar una base de datos en memoria para tests
const db = new sqlite3.Database(":memory:");

// Inicializar la base de datos para tests
const initializeTestDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabla de usuarios
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabla de citas
      db.run(
        `
        CREATE TABLE IF NOT EXISTS appointments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          duration INTEGER NOT NULL,
          user_id INTEGER,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );

      // Crear función SQL personalizada para tests
      db.run(`
        CREATE FUNCTION time_to_minutes(timeStr TEXT) 
        RETURNS INTEGER AS 
        'SELECT CAST(substr(timeStr, 1, 2) AS INTEGER) * 60 + CAST(substr(timeStr, 4, 2) AS INTEGER)'
      `);
    });
  });
};

// Limpiar la base de datos entre tests
const clearDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("DELETE FROM appointments", (err) => {
        if (err) reject(err);
        else {
          db.run("DELETE FROM users", (err) => {
            if (err) reject(err);
            else resolve();
          });
        }
      });
    });
  });
};

export { db, initializeTestDatabase, clearDatabase };
