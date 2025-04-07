import db from "../db/database.js";

export const getAvailableSlots = (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Fecha requerida" });
  }

  // Configuración de horarios
  const businessHours = {
    start: 9 * 60,
    end: 17 * 60,
    slotDuration: 30,
  };

  // Generar todos los slots posibles para el día
  const slots = [];
  for (
    let time = businessHours.start;
    time < businessHours.end;
    time += businessHours.slotDuration
  ) {
    const hours = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (time % 60).toString().padStart(2, "0");
    slots.push({
      time: `${hours}:${minutes}`,
      available: true,
      startMinutes: time,
      endMinutes: time + businessHours.slotDuration,
    });
  }

  // Obtengo las citas para ese día
  db.all(
    "SELECT time, duration FROM appointments WHERE date = ?",
    [date],
    (err, appointments) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Marco los slots no disponibles
      appointments.forEach((appointment) => {
        const [hours, minutes] = appointment.time.split(":").map(Number);
        const appointmentStart = hours * 60 + minutes;
        const appointmentEnd = appointmentStart + Number(appointment.duration);

        slots.forEach((slot) => {
          // Si hay solapamiento, marcar como no disponible
          if (
            !(
              slot.endMinutes <= appointmentStart ||
              slot.startMinutes >= appointmentEnd
            )
          ) {
            slot.available = false;
          }
        });
      });

      // Filtrar solo la información necesaria
      const availableSlots = slots.map(({ time, available }) => ({
        time,
        available,
      }));

      res.json({ date, slots: availableSlots });
    }
  );
};
