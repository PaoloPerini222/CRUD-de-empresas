import { crearApi } from "./client.js";

// Cliente HTTP del recurso /evento (singular, así lo expone el back).
export const eventosApi = crearApi("/evento");
