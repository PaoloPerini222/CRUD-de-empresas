import { Router } from "express";
import {
    obtenerCierres,
    obtenerCierre,
    crearCierre,
    editarCierre,
    eliminarCierre,
} from "../controllers/cierre.controller.js";

const router = Router();

export default router;
