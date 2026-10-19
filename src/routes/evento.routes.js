import { Router } from "express";
import {
    obtenerEventos,
    obtenerEvento,
    crearEvento,
    editarEvento,
    eliminarEvento,
} from "../controllers/evento.controller.js";

const router = Router();

export default router;
