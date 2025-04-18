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
    
}
