import { Router } from "express";
import clienteRoutes from "./cliente.routes.js";
import eventoRoutes from "./evento.routes.js";
import propuestaRoutes from "./propuesta.routes.js";
import detallePropuestaRoutes from "./detalle-propuesta.routes.js";
import personalRoutes from "./personal.routes.js";
import rolRoutes from "./rol.routes.js";
import proveedorRoutes from "./proveedor.routes.js";
import servicioRoutes from "./servicio.routes.js";
import tareaRoutes from "./tarea.routes.js";
import cierreRoutes from "./cierre.routes.js";
import cambioEventoRoutes from "./cambio-evento.routes.js";
import avisoProveedorCancelacionRoutes from "./aviso-proveedor-cancelacion.routes.js";

const router = Router();

export default router;
