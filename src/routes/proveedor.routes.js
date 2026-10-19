import { Router } from "express";
import {
    obtenerProveedores,
    obtenerProveedor,
    crearProveedor,
    editarProveedor,
    eliminarProveedor,
} from "../controllers/proveedor.controller.js";

const router = Router();

export default router;
