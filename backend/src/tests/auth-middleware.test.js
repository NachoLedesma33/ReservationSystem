import jwt from "jsonwebtoken";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  // Test para token no proporcionado
  test("Debe retornar 401 si no se proporciona token", () => {
    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Acceso denegado" });
    expect(next).not.toHaveBeenCalled();
  });

  // Test para token inválido
  test("Debe retornar 403 si el token es inválido", () => {
    req.headers["authorization"] = "Bearer invalidtoken";

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Token inválido o expirado",
    });
    expect(next).not.toHaveBeenCalled();
  });

  // Test para token válido
  test("Debe pasar al siguiente middleware si el token es válido", () => {
    const validToken = jwt.sign(
      { userId: 1, email: "test@example.com", role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    req.headers["authorization"] = `Bearer ${validToken}`;

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(1);
    expect(req.user.role).toBe("user");
  });

  // Test para autorización de rol
  test("Debe autorizar al usuario si tiene el rol requerido", () => {
    req.user = { userId: 1, email: "test@example.com", role: "admin" };

    const roleMiddleware = authorizeRole(["admin", "superadmin"]);
    roleMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // Test para rechazar usuario sin el rol requerido
  test("Debe rechazar al usuario si no tiene el rol requerido", () => {
    req.user = { userId: 1, email: "test@example.com", role: "user" };

    const roleMiddleware = authorizeRole(["admin"]);
    roleMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "No autorizado" });
    expect(next).not.toHaveBeenCalled();
  });

  // Test para rechazar usuario sin autenticación
  test("Debe rechazar al usuario si no está autenticado", () => {
    req.user = undefined;

    const roleMiddleware = authorizeRole(["admin"]);
    roleMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No autenticado" });
    expect(next).not.toHaveBeenCalled();
  });
});
