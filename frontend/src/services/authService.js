// Llamadas de autenticación al back. Devuelven directamente el cuerpo de la respuesta.
// login -> { token, usuario } | registrar -> usuario nuevo | obtenerPerfil -> usuario actual
import api from "./api";

export const login = (email, password) =>
  api.post("/auth/login", { email, password }).then((res) => res.data);

export const registrar = (datos) =>
  api.post("/auth/register", datos).then((res) => res.data);

export const obtenerPerfil = () =>
  api.get("/auth/perfil").then((res) => res.data);
