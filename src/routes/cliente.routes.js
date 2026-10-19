import { Router } from "express";
import {
    obtenerClientes,
    obtenerCliente,
    crearCliente,
    editarCliente,
    eliminarCliente,
} from "../controllers/cliente.controller.js";

const router = Router();

export default router;
