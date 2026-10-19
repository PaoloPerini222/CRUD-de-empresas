import { Router } from "express";
import {
    obtenerRoles,
    obtenerRol,
    crearRol,
    editarRol,
    eliminarRol,
} from "../controllers/rol.controller.js";

const router = Router();

export default router;
