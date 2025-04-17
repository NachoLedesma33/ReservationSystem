const API_BASE_URL = import.meta.env.API_BASE_URL || "http://localhost:3000";

export async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

export const api = {
  login: (credentials) =>
    fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  getAppointments: () => fetchWithAuth("/appointments"),
  createAppointment: (appointment) =>
    fetchWithAuth("/appointments", {
      method: "POST",
      body: JSON.stringify(appointment),
    }),
  updateAppointment: (appointment) =>
    fetchWithAuth("/appointments", {
      method: "PUT",
      body: JSON.stringify(appointment),
    }),
  deleteAppointment: (id) =>
    fetchWithAuth("/appointments", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }),
  getAvailableSlots: () => fetchWithAuth("/availability"),
};
