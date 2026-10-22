import { crearApi } from "./client.js";

// Cliente HTTP del recurso /tareas.
export const tareasApi = crearApi("/tarea");
