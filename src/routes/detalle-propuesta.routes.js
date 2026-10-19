import { Router } from "express";
import {
    obtenerDetallesPropuesta,
    obtenerDetallePropuesta,
    crearDetallePropuesta,
    editarDetallePropuesta,
    eliminarDetallePropuesta,
} from "../controllers/detalle-propuesta.controller.js";

const router = Router();

export default router;
