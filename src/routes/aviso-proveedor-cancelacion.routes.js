import { Router } from "express";
import {
    obtenerAvisosProveedorCancelacion,
    obtenerAvisoProveedorCancelacion,
    crearAvisoProveedorCancelacion,
    editarAvisoProveedorCancelacion,
    eliminarAvisoProveedorCancelacion,
} from "../controllers/aviso-proveedor-cancelacion.controller.js";

const router = Router();

export default router;
