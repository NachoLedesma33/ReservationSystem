import request from "supertest";
import bcrypt from "bcrypt";
import app from "../src/app.js";
import {
  db,
  initializeTestDatabase,
  clearDatabase,
} from "../src/db/database.test.js";

// Reemplazar la importación de la base de datos en authController
jest.mock("../src/db/database.js", () => {
  return { __esModule: true, default: db };
});

describe("Auth Controller", () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll((done) => {
    db.close(() => {
      done();
    });
  });

  // Test para registro de usuario
  test("Debe registrar un nuevo usuario", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    };

    const res = await request(app).post("/api/auth/register").send(userData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("userId");
    expect(res.body.message).toBe("Usuario registrado exitosamente");
  });

  // Test para email duplicado
  test("Debe rechazar registro con email duplicado", async () => {
    const userData = {
      name: "Test User",
      email: "duplicate@example.com",
      password: "password123",
    };

    // Primer registro
    await request(app).post("/api/auth/register").send(userData);

    // Intento de registro duplicado
    const res = await request(app).post("/api/auth/register").send(userData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("El email ya está registrado");
  });

  // Test para login exitoso
  test("Debe autenticar al usuario correctamente", async () => {
    // Crear usuario
    const hashedPassword = await bcrypt.hash("password123", 10);
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        ["Test User", "login@example.com", hashedPassword],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Intento de login
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("userId");
    expect(res.body.message).toBe("Login exitoso");
  });

  // Test para login fallido
  test("Debe rechazar login con credenciales incorrectas", async () => {
    // Crear usuario
    const hashedPassword = await bcrypt.hash("password123", 10);
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        ["Test User", "wrong@example.com", hashedPassword],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Intento de login con contraseña incorrecta
    const res = await request(app).post("/api/auth/login").send({
      email: "wrong@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Credenciales inválidas");
  });
});
