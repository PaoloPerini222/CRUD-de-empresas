import { Router } from "express";
import { verificarToken } from "../middleware/auth.middleware.js";
import { conRol } from "../middleware/permisos.js";
import { obtenerEmpresas,
    obtenerEmpresa,
    crearEmpresa,
    editarEmpresa,
    eliminarEmpresa } from "../controllers/empresas.controller.js";

const router = Router();

router.use(verificarToken, conRol);

router.get("/", obtenerEmpresas);
router.get("/:id", obtenerEmpresa);
router.post("/", crearEmpresa);
router.put("/:id", editarEmpresa);
router.delete("/:id", eliminarEmpresa);

export default router;
