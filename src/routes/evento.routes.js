import { Router } from "express";
import {
    obtenerEventos,
    obtenerEvento,
    crearEvento,
    editarEvento,
    eliminarEvento,
} from "../controllers/evento.controller.js";

const router = Router();

router.get("/", obtenerEventos);

router.get("/:id", obtenerEvento);

router.post("/", crearEvento);

router.put("/:id", editarEvento);

router.delete("/:id", eliminarEvento);

export default router;
