import { useAuth } from "../context/AuthContext.jsx";

// Qué puede hacer el usuario actual. Solo sirve para mostrar u ocultar botones:
// el back vuelve a verificar todo y es quien decide.
//   Organizador  -> clientes, eventos propios (propuesta, servicios, tareas, exclusiones), proveedores y servicios
//   Responsable  -> aprueba propuestas, gestiona el personal y sus roles, decide cancelaciones de la organizadora
//   Coordinador  -> situación de cada proveedor, estado de cualquier tarea y avisos de cancelación
//   Todos        -> consultan todo y registran cambios relevantes
export default function usePermisos() {
  const { usuario } = useAuth();
  const roles = usuario?.roles ?? [];
  const yo = usuario?.id_personal;

  const esOrganizador = roles.includes("organizador");
  const esResponsable = roles.includes("responsable");
  const esCoordinador = roles.includes("coordinador");
  const esDuenoDe = (evento) => esOrganizador && evento?.id_organizador != null && evento.id_organizador === yo;

  return {
    yo,
    roles,
    tieneRol: roles.length > 0,
    esOrganizador,
    esResponsable,
    esCoordinador,
    esDuenoDe,
    puedeCambiarEstadoTarea: (tarea) => esCoordinador || tarea?.id_personal === yo,
  };
}
