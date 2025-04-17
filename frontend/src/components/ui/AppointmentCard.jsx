import React from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import { format } from "date-fns";

export default function AppointmentCard({ appointment }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {appointment.title}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {format(new Date(appointment.date), "yyyy-MM-dd HH:mm")}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {appointment.description}
        </Typography>
        <Box mt={2}>
          <Button variant="contained" color="primary">
            Editar
          </Button>
          <Button variant="contained" color="error" sx={{ ml: 2 }}>
            Borrar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
