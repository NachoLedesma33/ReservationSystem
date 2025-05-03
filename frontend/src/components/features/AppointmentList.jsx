import React, { useState, useEffect } from "react";
import { Button, CircularProgress, Box, Typography, Grid } from "@mui/material";
import AppointmentCard from "../ui/AppointmentCard";
import { api } from "../../utils/api";

export default function AppointmentList({
  appointments: initialAppointments = [],
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialAppointments.length === 0) {
      refreshAppointments();
    }
  }, []);

  const refreshAppointments = async () => {
    setLoading(true);
    try {
      const data = await api.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Error refreshing appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      );
    }

    if (appointments.length === 0) {
      return (
        <Box textAlign="center" my={12}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No tienes citas programadas
          </Typography>
          <Button variant="contained" color="primary" href="/appointments/new">
            Programar una cita
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={2}>
        {appointments.map((appointment) => (
          <Grid item xs={12} md={6} lg={4} key={appointment.id}>
            <AppointmentCard appointment={appointment} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return <Box>{renderContent()}</Box>;
}
