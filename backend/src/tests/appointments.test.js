import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import {
  db,
  initializeTestDatabase,
  clearDatabase,
} from "../src/db/database.test.js";

// Reemplazar la importación de la base de datos en appointmentController
jest.mock("../src/db/database.js", () => {
  return { __esModule: true, default: db };
});

describe("Appointment Controller", () => {
  let userToken;
  let adminToken;
  let userId;
  let adminId;

  beforeAll(async () => {
    await initializeTestDatabase();

    // Crear usuario de prueba
    userId = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["Test User", "user@example.com", "hashedpassword", "user"],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Crear admin de prueba
    adminId = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["Admin User", "admin@example.com", "hashedpassword", "admin"],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Generar tokens JWT
    userToken = jwt.sign(
      { userId, email: "user@example.com", role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    adminToken = jwt.sign(
      { userId: adminId, email: "admin@example.com", role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  afterEach(async () => {
    // Limpiar solo la tabla de citas después de cada test
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM appointments", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  afterAll((done) => {
    db.close(() => {
      done();
    });
  });

  // Test para crear una cita
  test("Debe crear una nueva cita", async () => {
    const appointmentData = {
      title: "Test Appointment",
      description: "Test description",
      date: "2025-05-01",
      time: "10:00",
      duration: 30,
    };

    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${userToken}`)
      .send(appointmentData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("appointmentId");
    expect(res.body.message).toBe("Cita creada exitosamente");
  });

  // Test para obtener citas del usuario
  test("Debe obtener solo las citas del usuario autenticado", async () => {
    // Crear una cita para el usuario de prueba
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO appointments (title, description, date, time, duration, user_id) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "User Appointment",
          "User description",
          "2025-05-01",
          "10:00",
          30,
          userId,
        ],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Crear una cita para otro usuario
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO appointments (title, description, date, time, duration, user_id) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "Other Appointment",
          "Other description",
          "2025-05-01",
          "11:00",
          30,
          adminId,
        ],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const res = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("appointments");
    expect(res.body.appointments.length).toBe(1);
    expect(res.body.appointments[0].title).toBe("User Appointment");
  });

  // Test para que el admin pueda ver todas las citas
  test("Admin debe ver todas las citas", async () => {
    // Crear una cita para el usuario de prueba
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO appointments (title, description, date, time, duration, user_id) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "User Appointment",
          "User description",
          "2025-05-01",
          "10:00",
          30,
          userId,
        ],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Crear una cita para el admin
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO appointments (title, description, date, time, duration, user_id) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "Admin Appointment",
          "Admin description",
          "2025-05-01",
          "11:00",
          30,
          adminId,
        ],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const res = await request(app)
      .get("/api/appointments/admin/all")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("appointments");
    expect(res.body.appointments.length).toBe(2);
  });

  // Test para actualizar una cita
  test("Debe actualizar una cita", async () => {
    // Crear una cita para el usuario de prueba
    const appointmentId = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO appointments (title, description, date, time, duration, user_id) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "Update Test",
          "Original description",
          "2025-05-01",
          "10:00",
          30,
          userId,
        ],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    const updateData = {
      title: "Updated Appointment",
      description: "Updated description",
    };

    const res = await request(app)
      .put(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(updateData);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Cita actualizada exitosamente");

    // Verificar que se actualizó correctamente
    const appointment = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM appointments WHERE id = ?",
        [appointmentId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    expect(appointment.title).toBe("Updated Appointment");
    expect(appointment.description).toBe("Updated description");
  });

  // Test para eliminar una cita
  test("Debe eliminar una cita", async () => {
    // Crear una cita para el usuario de prueba
    const appointmentId = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO appointments (title, description, date, time, duration, user_id) VALUES (?, ?, ?, ?, ?, ?)",
        ["Delete Test", "Test description", "2025-05-01", "10:00", 30, userId],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    const res = await request(app)
      .delete(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Cita eliminada exitosamente");

    // Verificar que se eliminó correctamente
    const appointment = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM appointments WHERE id = ?",
        [appointmentId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    expect(appointment).toBeUndefined();
  });

  // Test para no poder modificar citas de otros usuarios
  test("Usuario no debe poder modificar citas de otros", async () => {
    // Crear una cita para el admin
    const appointmentId = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO appointments (title, description, date, time, duration, user_id) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "Admin Appointment",
          "Admin description",
          "2025-05-01",
          "10:00",
          30,
          adminId,
        ],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    const updateData = {
      title: "Hacked Appointment",
      description: "Hacked description",
    };

    const res = await request(app)
      .put(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(updateData);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Cita no encontrada");
  });
});
