import { Router } from "express";
import {
    obtenerServicios,
    obtenerServicio,
    crearServicio,
    editarServicio,
    eliminarServicio,
} from "../controllers/servicio.controller.js";

const router = Router();

export default router;
