import request from "supertest";
import app from "../src/app.js";
import {
  db,
  initializeTestDatabase,
  clearDatabase,
} from "../src/db/database.test.js";

// Reemplazar la importación de la base de datos en availabilityController
jest.mock("../src/db/database.js", () => {
  return { __esModule: true, default: db };
});

describe("Availability Controller", () => {
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

  // Test para obtener slots disponibles
  test("Debe retornar todos los slots disponibles para un día sin citas", async () => {
    const res = await request(app)
      .get("/api/availability")
      .query({ date: "2025-05-01" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("slots");
    expect(res.body.slots.length).toBeGreaterThan(0);

    // Todos los slots deberían estar disponibles
    const allAvailable = res.body.slots.every(
      (slot) => slot.available === true
    );
    expect(allAvailable).toBe(true);
  });

  // Test para marcar slots ocupados
  test("Debe marcar slots como no disponibles cuando hay citas", async () => {
    // Crear una cita para el día
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO appointments (title, description, date, time, duration, user_id) VALUES (?, ?, ?, ?, ?, ?)",
        ["Test Appointment", "Test description", "2025-05-02", "10:00", 60, 1],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const res = await request(app)
      .get("/api/availability")
      .query({ date: "2025-05-02" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("slots");

    // Verificar que algunos slots estén marcados como no disponibles
    const unavailableSlots = res.body.slots.filter(
      (slot) => slot.available === false
    );
    expect(unavailableSlots.length).toBeGreaterThan(0);

    // El slot de las 10:00 debería estar ocupado
    const slot1000 = res.body.slots.find((slot) => slot.time === "10:00");
    expect(slot1000.available).toBe(false);

    // El slot de las 10:30 también debería estar ocupado (cita de 60 min)
    const slot1030 = res.body.slots.find((slot) => slot.time === "10:30");
    expect(slot1030.available).toBe(false);
  });

  // Test para error cuando no se proporciona fecha
  test("Debe retornar error 400 cuando no se proporciona fecha", async () => {
    const res = await request(app).get("/api/availability");

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Fecha requerida");
  });
});
