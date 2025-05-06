import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle, LogOut } from "lucide-react";

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
    setAnchorEl(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span
              className="text-xl font-bold text-blue-600 cursor-pointer"
              onClick={() => navigate("/")}
            >
              Reservas
            </span>
          </div>

          <div className="flex items-center">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={handleMenu}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <UserCircle className="h-8 w-8 text-gray-600" />
                  <span className="text-gray-700">{username || "Usuario"}</span>
                </button>
                {anchorEl && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
