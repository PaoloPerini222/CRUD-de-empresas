import { useMemo } from "react";
import Estado from "../components/Estado.jsx";
import PaginaCrud from "../components/PaginaCrud.jsx";
import { tareasApi } from "../api/tareas.js";
import { useAuth } from "../context/AuthContext.jsx";
import { etiqueta, fechaCorta } from "../utils/formato.js";

const ESTADOS = [
  ["pendiente", "var(--amber)"],
  ["en_curso", "var(--cyan)"],
  ["terminada", "var(--lime)"],
  ["cancelada", "var(--red)"],
];
const colorEstado = Object.fromEntries(ESTADOS);

export default function Tareas() {
  const { usuario } = useAuth();

  const config = useMemo(() => ({
    titulo: "Tareas",
    singular: "tarea",
    femenino: true,
    api: tareasApi,
    id: "id_tarea",
    buscar: (t) => `${t.descripcion} ${t.estado} ${t.id_evento}`,
    columnas: [
      { titulo: "Tarea", render: (t) => t.descripcion },
      { titulo: "Evento", render: (t) => `Evento #${t.id_evento}` },
      { titulo: "Responsable", render: (t) => (t.id_personal === usuario?.id_personal ? "Vos" : `Personal #${t.id_personal}`) },
      {
        titulo: "Fecha prevista",
        render: (t) => (
          <span style={t.vencida ? { color: "var(--red)" } : undefined}>
            {fechaCorta(t.fecha_prevista)}{t.vencida ? " · vencida" : ""}
          </span>
        ),
      },
      {
        titulo: "Estado",
        render: (t) => <Estado estado={t.estado} color={colorEstado[t.estado]} />,
      },
    ],
    campos: [
      { name: "descripcion", label: "Descripción", required: true, full: true },
      { name: "id_evento", label: "ID del evento", type: "number", required: true, step: 1 },
      { name: "id_personal", label: "ID del responsable", type: "number", required: true, step: 1, defecto: usuario?.id_personal },
      { name: "fecha_prevista", label: "Fecha prevista", type: "date", required: true },
      {
        name: "estado", label: "Estado", type: "select", required: true, defecto: "pendiente",
        options: ESTADOS.map(([value]) => ({ value, label: etiqueta(value) })),
      },
    ],
  }), [usuario?.id_personal]);

  return <PaginaCrud config={config} />;
}
