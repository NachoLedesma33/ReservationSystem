import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, Loader2 } from "lucide-react";
import { api } from "../../utils/api";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
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
      const { confirmPassword, ...userData } = formData;
      await api.register(userData);
      setSuccess(true);
      setTimeout(() => (window.location.href = "/login"), 2000);
    } catch (error) {
      setErrorMessage(
        "No se pudo completar el registro. Este correo electrónico puede ya estar en uso."
      );
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    icon: Icon,
    type = "text",
    name,
    placeholder,
    ...props
  }) => (
    <div className="mb-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Icon size={20} />
        </div>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors[name] ? "border-red-500" : "border-gray-300"
          }`}
          placeholder={placeholder}
          disabled={loading || success}
          {...props}
        />
        {name === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            disabled={loading || success}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Crear Cuenta
      </h2>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
          ¡Registro exitoso! Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          icon={User}
          type="text"
          name="name"
          placeholder="Nombre completo"
        />

        <InputField
          icon={Mail}
          type="email"
          name="email"
          placeholder="correo@ejemplo.com"
        />

        <InputField
          icon={Lock}
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Contraseña"
        />

        <InputField
          icon={Lock}
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirmar contraseña"
        />

        <button
          type="submit"
          disabled={loading || success}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
            loading || success
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2" size={20} />
              Procesando...
            </span>
          ) : (
            "Registrarse"
          )}
        </button>
      </form>
    </div>
  );
}
