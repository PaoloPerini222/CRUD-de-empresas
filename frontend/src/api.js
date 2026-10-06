const BASE = import.meta.env.VITE_API_URL || "/api/empresas";

async function pedir(ruta = "", opciones = {}) {
  let res;
  try {
    res = await fetch(BASE + ruta, {
      headers: { "Content-Type": "application/json" },
      ...opciones,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Verificá que el backend esté corriendo.");
  }

  const datos = await res.json().catch(() => null);
  if (!res.ok) {
    // El backend responde { mensaje } (en algunos casos { Mensaje })
    const mensaje = datos?.mensaje || datos?.Mensaje || `Error ${res.status}`;
    const error = new Error(mensaje);
    error.status = res.status;
    throw error;
  }
  return datos;
}

export const listarEmpresas = () => pedir();
export const crearEmpresa = (empresa) => pedir("", { method: "POST", body: JSON.stringify(empresa) });
export const editarEmpresa = (id, empresa) => pedir(`/${id}`, { method: "PUT", body: JSON.stringify(empresa) });
export const eliminarEmpresa = (id) => pedir(`/${id}`, { method: "DELETE" });
