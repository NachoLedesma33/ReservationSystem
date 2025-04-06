import db from "../db/database";

//Obtengo todas la citas
export const getAllApointments = (req, res) => {
  db.all("SELECT * FROM appointments", [], (err, rows) => {
    if (err) {
      return res.statys(500).json({ error: err.message });
    }
    res.json({ appointments: rows });
  });
};

//Obtener un cita por ID
export const getAppointmentById = (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM WHERE id = ? ", [id], (err, row) => {
    if (err) {
      return res.statys(500).json({ error: err.message });
    }
    res.json({ appointment: row });
  });
};

//Creo una nueva cita
export const createAppointment = (req, res) => {
  const { title, description, date, time, duration, user_id } = req.body;
  if (!title || !date || !time || !duration) {
    return res
      .status(400)
      .json({ error: "faltan datos requeridos para crear una cita " });
  }
  const sql = `INSERT INTO appointments(title, description, date, time, duration, user_id) VALUES(?, ?, ?, ?, ?, ?)`;
  db.run(
    sql,
    [title, description, date, time, duration, user_id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: "cita creada exitosamente",
        appointmentId: this.lastID,
      });
    }
  );
};

//Actualizar una cita
export const updateAppointment = (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, duration, status } = req.body;
  if ((!title || !date, !time || !duration)) {
    return res.status(400).json({
      error: "faltan datos requeridos para actualizar una cita",
    });
  }
  const sql = `UPDATE appointments SET title = ?, description = ?, date = ?, time = ?, duration = ?, status = ? WHERE id = ?`;
  db.run(
    sql,
    [
      title || row.title,
      description || row.description,
      date || row.date,
      time || row.time,
      duration || row.duration,
      status || row.status,
      id,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Cita actualizada exitosamente" });
    }
  );
};

//Eliminar una cita
export const deleteAppointment = (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM appointments WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({
      message: "cita eliminada exitosamente",
      appointmentId: id,
    });
  });
};
