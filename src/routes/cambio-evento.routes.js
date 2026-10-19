import { Router } from "express";
import {
    obtenerCambiosEvento,
    obtenerCambioEvento,
    crearCambioEvento,
    editarCambioEvento,
    eliminarCambioEvento,
} from "../controllers/cambio-evento.controller.js";

const router = Router();

export default router;
