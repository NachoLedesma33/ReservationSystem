import db from "../db/database.js";

// Obtener todas las citas del usuario autenticado
export const getAllAppointments = (req, res) => {
  const userId = req.user.userId;
  const isAdmin = req.user.role === "admin";

  let sql = "SELECT * FROM appointments";
  let params = [];

  // Si no es admin, filtrar por usuario
  if (!isAdmin && req.path !== "/admin/all") {
    sql += " WHERE user_id = ?";
    params.push(userId);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ appointments: rows });
  });
};

// Obtener una cita por ID
export const getAppointmentById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const isAdmin = req.user.role === "admin";

  let sql = "SELECT * FROM appointments WHERE id = ?";
  let params = [id];

  // Si no es admin, filtrar por usuario
  if (!isAdmin) {
    sql += " AND user_id = ?";
    params.push(userId);
  }

  db.get(sql, params, (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }
    res.json({ appointment: row });
  });
};

// Crear una nueva cita
export const createAppointment = (req, res) => {
  const { title, description, date, time, duration } = req.body;
  const userId = req.user.userId;

  if (!title || !date || !time || !duration) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  // Verificar disponibilidad
  checkAvailability(date, time, duration, (err, available) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!available) {
      return res
        .status(400)
        .json({ error: "El horario solicitado no está disponible" });
    }

    const sql = `
      INSERT INTO appointments (title, description, date, time, duration, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [title, description, date, time, duration, userId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          message: "Cita creada exitosamente",
          appointmentId: this.lastID,
        });
      }
    );
  });
};

// Actualizar una cita
export const updateAppointment = (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, duration, status } = req.body;
  const userId = req.user.userId;
  const isAdmin = req.user.role === "admin";

  let sql = "SELECT * FROM appointments WHERE id = ?";
  let params = [id];

  // Si no es admin, filtrar por usuario
  if (!isAdmin) {
    sql += " AND user_id = ?";
    params.push(userId);
  }

  db.get(sql, params, (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    // Si cambia fecha/hora, verificar disponibilidad
    if (
      (date && date !== row.date) ||
      (time && time !== row.time) ||
      (duration && duration !== row.duration)
    ) {
      checkAvailability(
        date || row.date,
        time || row.time,
        duration || row.duration,
        id,
        (err, available) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          if (!available) {
            return res
              .status(400)
              .json({ error: "El horario solicitado no está disponible" });
          }

          updateAppointmentRecord();
        }
      );
    } else {
      updateAppointmentRecord();
    }

    function updateAppointmentRecord() {
      const updateSql = `
        UPDATE appointments
        SET title = ?, description = ?, date = ?, time = ?, duration = ?, status = ?
        WHERE id = ?
      `;

      db.run(
        updateSql,
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
    }
  });
};

// Eliminar una cita
export const deleteAppointment = (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const isAdmin = req.user.role === "admin";

  let sql = "DELETE FROM appointments WHERE id = ?";
  let params = [id];

  // Si no es admin, filtrar por usuario
  if (!isAdmin) {
    sql += " AND user_id = ?";
    params.push(userId);
  }

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }
    res.json({ message: "Cita eliminada exitosamente" });
  });
};

// Función auxiliar para verificar disponibilidad
function checkAvailability(
  date,
  time,
  duration,
  appointmentId = null,
  callback
) {
  // Convertir time a minutos desde medianoche para facilitar comparación
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const requestedStart = timeToMinutes(time);
  const requestedEnd = requestedStart + Number(duration);

  let sql = `
    SELECT * FROM appointments 
    WHERE date = ? 
    AND ((time_to_minutes(time) < ? AND time_to_minutes(time) + duration > ?)
    OR (time_to_minutes(time) >= ? AND time_to_minutes(time) < ?))
  `;

  let params = [
    date,
    requestedEnd,
    requestedStart,
    requestedStart,
    requestedEnd,
  ];

  // Si es una actualización, excluir la cita actual
  if (appointmentId) {
    sql += " AND id != ?";
    params.push(appointmentId);
  }

  // Crear función SQL personalizada si no existe
  db.run(
    `
    CREATE FUNCTION IF NOT EXISTS time_to_minutes(timeStr TEXT) 
    RETURNS INTEGER AS 
    'SELECT CAST(substr(timeStr, 1, 2) AS INTEGER) * 60 + CAST(substr(timeStr, 4, 2) AS INTEGER)'
  `,
    [],
    (err) => {
      if (err) {
        return callback(err, false);
      }

      db.all(sql, params, (err, rows) => {
        if (err) {
          return callback(err, false);
        }

        // Si hay filas, significa que hay conflicto
        callback(null, rows.length === 0);
      });
    }
  );
}


