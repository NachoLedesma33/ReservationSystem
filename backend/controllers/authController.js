import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/database.js";

//Registro un nuevo usuario
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }

  //Verificar si el usuario ya existe
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Error al buscar el usuario" });
    }
    if (user) {
      return res
        .status(409)
        .json({ message: "El correo electrónico ya está registrado" });
    }
  });
  //Hashear la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  //Inserto el usuario
  const sql = "INSERT INTO users (name, email, password) VALUES(?, ?, ?)";
  db.run(sql, [name, email, hashedPassword], function (err) {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    const token = jwt.sign(
      {
        userId: this.lastID,
        email,
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.status(201).json({ message: "Usuario registrado exitosamente", token });
  });
};

//Login del usuario
export const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email y contraseña son obligatorios" });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Comparo las contraseñas
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Genero el  token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login exitoso",
      userId: user.id,
      name: user.name,
      role: user.role,
      token,
    });
  });
};

// Obtengo el perfil de usuario
export const getProfile = (req, res) => {
  const userId = req.user.userId;

  db.get(
    "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json({ user });
    }
  );
};
