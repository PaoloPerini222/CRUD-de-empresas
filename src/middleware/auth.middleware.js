import jwt from "jsonwebtoken";
import pool from "../data/db.js";

// Verifica el token y carga los roles actuales desde la base (no los del token),
// para que quitar o dar un rol valga al instante.
export const verificarToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  let datos;
  try {
    datos = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ mensaje: "El token expiró" });
    }
    return res.status(401).json({ mensaje: "Token inválido" });
  }

  try {
    const roles = await pool.query(`
      SELECT r.nombre
      FROM personal_rol pr
      JOIN rol r ON r.id_rol = pr.id_rol
      WHERE pr.id_personal = $1`, [datos.id_personal ?? null]);

    req.usuario = { ...datos, roles: roles.rows.map((fila) => fila.nombre) };
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al verificar los permisos" });
  }
};

// Usar después de verificarToken: permite el paso si el usuario tiene al menos uno de los roles.
export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    const roles = req.usuario?.roles ?? [];
    if (!roles.some((rol) => rolesPermitidos.includes(rol))) {
      return res.status(403).json({ mensaje: "No tenés permiso para esta acción" });
    }
    next();
  };
};
