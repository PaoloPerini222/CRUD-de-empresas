import { Router } from "express";
import {
    obtenerTareas,
    obtenerTarea,
    crearTarea,
    editarTarea,
    eliminarTarea,
} from "../controllers/tarea.controller.js";

const router = Router();

export default router;
