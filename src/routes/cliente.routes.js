import { Router } from "express";
import {
    obtenerClientes,
    obtenerCliente,
    crearCliente,
    editarCliente,
    eliminarCliente,
} from "../controllers/cliente.controller.js";

const router = Router();

router.get("/", obtenerClientes);

router.get("/:id", obtenerCliente);

router.post("/", crearCliente);

router.put("/:id", editarCliente);

router.delete("/:id", eliminarCliente);

export default router;
