import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import MUIThemeProvider from "../ui/ThemeProvider";
import { api } from "../../utils/api";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function NewAppointmentForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: 30,
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const durations = [15, 30, 45, 60, 90, 120];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setFormData({
      ...formData,
      date,
      time: "",
    });

    if (date) {
      try {
        setLoadingSlots(true);
        const availabilityData = await api.getAvailability(date);
        setAvailableSlots(availabilityData.availableSlots || []);
      } catch (error) {
        console.error("Error loading available slots:", error);
        setAvailableSlots([]);
        setErrorMessage("Error al cargar los horarios disponibles");
      } finally {
        setLoadingSlots(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es requerido";
    }

    if (!formData.date) {
      newErrors.date = "La fecha es requerida";
    }

    if (!formData.time) {
      newErrors.time = "La hora es requerida";
    }

    if (!formData.duration) {
      newErrors.duration = "La duración es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage("");

    try {
      await api.createAppointment(formData);
      setSuccess(true);

      // Esperar 2 segundos y redirigir a la lista de citas
      setTimeout(() => {
        window.location.href = "/appointments";
      }, 2000);
    } catch (error) {
      setErrorMessage(
        "No se pudo programar la cita. Por favor, intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MUIThemeProvider>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Cita programada exitosamente!
              </Alert>
            )}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Título de la cita"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
              error={!!errors.date}
              helperText={errors.date}
              required
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.time}>
              <InputLabel>Horario</InputLabel>
              <Select
                name="time"
                value={formData.time}
                onChange={handleChange}
                label="Horario"
                required
                disabled={!availableSlots.length || loadingSlots}
              >
                {availableSlots.map((slot) => (
                  <MenuItem key={slot} value={slot}>
                    {slot}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.time}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.duration}>
              <InputLabel>Duración</InputLabel>
              <Select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                label="Duración"
                required
              >
                {durations.map((duration) => (
                  <MenuItem key={duration} value={duration}>
                    {duration} minutos
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.duration}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              startIcon={loading ? <CircularProgress size={20} /> : null}
              disabled={loading}
            >
              {loading ? "Programando..." : "Programar cita"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </MUIThemeProvider>
  );
}

useEffect(() => {
  if (selectedDate && availableSlots.length === 0 && !loadingSlots) {
    const demoSlots = [];
    for (let i = 9; i <= 17; i++) {
      demoSlots.push(`${i}:00`);
      if (i < 17) demoSlots.push(`${i}:30`);
    }
    setAvailableSlots(demoSlots);
  }
}, [selectedDate, availableSlots, loadingSlots]);
