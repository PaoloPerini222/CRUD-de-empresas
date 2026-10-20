// Conexión con el back. Todas las llamadas salen a /api/... (proxy de Vite o nginx).
const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

async function request(ruta, opciones = {}) {
  const res = await fetch(`${BASE_URL}${ruta}`, {
    headers: { "Content-Type": "application/json" },
    ...opciones,
  });

  if (res.status === 204) return null;

  const datos = await res.json().catch(() => null);
  if (!res.ok) throw new Error(datos?.mensaje || `Error ${res.status}`);
  return datos;
}

// CRUD estándar, mismo contrato que los controllers del back:
// GET /, GET /:id, POST /, PUT /:id, DELETE /:id
export function crearApi(recurso) {
  return {
    obtenerTodos: () => request(recurso),
    obtenerUno: (id) => request(`${recurso}/${id}`),
    crear: (datos) => request(recurso, { method: "POST", body: JSON.stringify(datos) }),
    editar: (id, datos) => request(`${recurso}/${id}`, { method: "PUT", body: JSON.stringify(datos) }),
    eliminar: (id) => request(`${recurso}/${id}`, { method: "DELETE" }),
  };
}
