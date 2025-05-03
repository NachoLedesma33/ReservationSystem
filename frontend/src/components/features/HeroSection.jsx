import React from "react";
import { Button, Container, Typography, Box } from "@mui/material";
import MUIThemeProvider from "../ui/ThemeProvider";

export default function HeroSection() {
  return (
    <MUIThemeProvider>
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20">
        <Container maxWidth="lg">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Typography
                variant="h2"
                component="h1"
                className="mb-4 font-bold"
              >
                Reserva tu cita en minutos
              </Typography>
              <Typography
                variant="h6"
                component="p"
                className="mb-6 opacity-90"
              >
                Sistema de reservas fácil de usar y eficiente para gestionar tus
                citas de forma simple.
              </Typography>
              <Box className="flex flex-wrap gap-4">
                <Button
                  variant="contained"
                  size="large"
                  href="/register"
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                >
                  Comenzar ahora
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  href="/appointments"
                  className="border-white text-white hover:bg-indigo-700"
                >
                  Ver disponibilidad
                </Button>
              </Box>
            </div>
            <div className="hidden md:block">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="bg-gray-100 h-64 rounded flex items-center justify-center">
                  <Typography className="text-gray-500 text-lg">
                    [Ilustración del calendario]
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </MUIThemeProvider>
  );
}
