import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = datos;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ mensaje: "El token expiró" });
    }
    return res.status(401).json({ mensaje: "Token inválido" });
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
