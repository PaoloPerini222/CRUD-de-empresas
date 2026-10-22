import { Router } from "express";
import { verificarToken } from "../middleware/auth.middleware.js";
import {
    obtenerClientes,
    obtenerCliente,
    crearCliente,
    editarCliente,
    eliminarCliente,
} from "../controllers/cliente.controller.js";

const router = Router();

router.use(verificarToken);

router.get("/", obtenerClientes);
router.get("/:id", obtenerCliente);
router.post("/", crearCliente);
router.put("/:id", editarCliente);
router.delete("/:id", eliminarCliente);

export default router;
