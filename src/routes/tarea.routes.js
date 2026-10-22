import { Router } from "express";
import { verificarToken } from "../middleware/auth.middleware.js";
import {
    obtenerTareas,
    obtenerTarea,
    crearTarea,
    editarTarea,
    eliminarTarea,
} from "../controllers/tarea.controller.js";

const router = Router();

router.use(verificarToken);

router.get("/", obtenerTareas);
router.get("/:id", obtenerTarea);
router.post("/", crearTarea);
router.put("/:id", editarTarea);
router.delete("/:id", eliminarTarea);

export default router;
