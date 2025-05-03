import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MUIThemeProvider from "../ui/ThemeProvider";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token) {
      setIsLoggedIn(true);
      if (user) {
        try {
          const userData = JSON.parse(user);
          setUsername(userData.name || "");
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      }
    }
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    handleClose();
    navigate("/");
  };

  return (
    <MUIThemeProvider>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Button
              color="inherit"
              onClick={() => navigate("/")}
              sx={{ fontSize: "1.25rem" }}
            >
              Sistema de Reservas
            </Button>
          </Typography>

          {!isLoggedIn ? (
            <Box>
              <Button color="inherit" onClick={() => navigate("/login")}>
                Iniciar Sesión
              </Button>
              <Button
                color="inherit"
                variant="outlined"
                sx={{ ml: 2 }}
                onClick={() => navigate("/register")}
              >
                Registrarse
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Button color="inherit" onClick={() => navigate("/appointments")}>
                Mis Citas
              </Button>
              <IconButton
                aria-label="menu de usuario"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{ ml: 2 }}
              >
                <Avatar sx={{ bgcolor: "primary.dark" }}>
                  {username ? (
                    username.charAt(0).toUpperCase()
                  ) : (
                    <AccountCircleIcon />
                  )}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/profile");
                  }}
                >
                  Mi Perfil
                </MenuItem>
                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </MUIThemeProvider>
  );
}
