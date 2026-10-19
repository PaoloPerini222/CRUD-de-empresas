import { Router } from "express";
import {
    obtenerPropuestas,
    obtenerPropuesta,
    crearPropuesta,
    editarPropuesta,
    eliminarPropuesta,
} from "../controllers/propuesta.controller.js";

const router = Router();

export default router;
