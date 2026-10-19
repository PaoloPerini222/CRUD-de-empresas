import { Router } from "express";
import {
    obtenerPersonales,
    obtenerPersonal,
    crearPersonal,
    editarPersonal,
    eliminarPersonal,
} from "../controllers/personal.controller.js";

const router = Router();

export default router;
