import request from "supertest";
import app from "../app.js";
import {
  db,
  initializeTestDatabase,
} from "../db/database.test.js";

// Reemplazar la importación de la base de datos
jest.mock("../db/database.js", () => {
  return { __esModule: true, default: db };
});

describe("API Integration Tests", () => {
  let userToken;
  let userId;

  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll((done) => {
    db.close(() => {
      done();
    });
  });

  // Test de flujo completo: registro, login, crear cita, obtener citas
  test("Flujo completo de usuario: registro, login, crear cita, obtener citas", async () => {
    // 1. Registro de usuario
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Integration Test User",
      email: "integration@example.com",
      password: "integration123",
    });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body).toHaveProperty("token");
    expect(registerRes.body).toHaveProperty("userId");

    userToken = registerRes.body.token;
    userId = registerRes.body.userId;

    // 2. Login con el usuario creado
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "integration@example.com",
      password: "integration123",
    });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty("token");
    expect(loginRes.body.userId).toBe(userId);

    // Actualizar token con el del login
    userToken = loginRes.body.token;

    // 3. Crear una cita
    const createAppointmentRes = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        userId: userId,
        date: "2025-04-15T10:00:00.000Z",
        description: "Cita de prueba de integración",
      });

    expect(createAppointmentRes.statusCode).toBe(201);
    expect(createAppointmentRes.body).toHaveProperty("appointmentId");
    expect(createAppointmentRes.body).toHaveProperty("userId", userId);
    expect(createAppointmentRes.body).toHaveProperty(
      "date",
      "2025-04-15T10:00:00.000Z"
    );

    const appointmentId = createAppointmentRes.body.appointmentId;

    // 4. Obtener las citas del usuario
    const getAppointmentsRes = await request(app)
      .get(`/api/appointments/user/${userId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(getAppointmentsRes.statusCode).toBe(200);
    expect(Array.isArray(getAppointmentsRes.body)).toBe(true);
    expect(getAppointmentsRes.body.length).toBeGreaterThan(0);
    expect(getAppointmentsRes.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          appointmentId: appointmentId,
          userId: userId,
          description: "Cita de prueba de integración",
          date: "2025-04-15T10:00:00.000Z",
        }),
      ])
    );
  });
});
