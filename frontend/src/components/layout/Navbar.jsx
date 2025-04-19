import React, { useState, useEffect } from "react";
import MuithemeProvider from "./ThemeProvider";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";

export default function Navbar() {
  const [inLoggedIn, setLoggedIn] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoggedIn(true);
      try {
        const userData = JSON.parse(username);
        setUsername(userData.username);
      } catch (error) {
        console.error("Error obteniendo usuario", error);
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
    setLoggedIn(false);
    handleClose();
    window.location.href = "/";
  };
   return (
    <MuithemeProvider>
      <AppBar position="static" className="mb-8">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Button color="inherit" href="/" className="text-xl">
              Sistema de Reservas
            </Button>
          </Typography>
          
          {!inLoggedIn ? (
            <Box>
              <Button color="inherit" href="/login">Iniciar Sesión</Button>
              <Button color="inherit" variant="outlined" className="ml-2" href="/register">Registrarse</Button>
            </Box>
          ) : (
            <Box>
              <Button color="inherit" href="/appointments">Mis Citas</Button>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar className="bg-indigo-800">
                  {username.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { handleClose(); window.location.href = '/profile'; }}>Mi Perfil</MenuItem>
                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </MuithemeProvider>
  );
}

