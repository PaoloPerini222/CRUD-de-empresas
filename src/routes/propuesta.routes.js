import { Router } from "express";
import { verificarToken } from "../middleware/auth.middleware.js";
import {
    obtenerPropuestas,
    obtenerPropuesta,
    crearPropuesta,
    editarPropuesta,
    eliminarPropuesta,
} from "../controllers/propuesta.controller.js";

const router = Router();

router.use(verificarToken);

router.get("/", obtenerPropuestas);
router.get("/:id", obtenerPropuesta);
router.post("/", crearPropuesta);
router.put("/:id", editarPropuesta);
router.delete("/:id", eliminarPropuesta);

export default router;
