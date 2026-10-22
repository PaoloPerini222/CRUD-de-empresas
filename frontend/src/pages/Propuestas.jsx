import PaginaCrud from "../components/PaginaCrud.jsx";
import { propuestasApi } from "../api/propuestas.js";
import { etiqueta, fechaCorta, moneda } from "../utils/formato.js";

const ESTADOS = [
  ["borrador", "var(--muted)"],
  ["pendiente_aprobacion", "var(--amber)"],
  ["aprobada", "var(--cyan)"],
  ["enviada", "var(--violet)"],
  ["en_negociacion", "var(--pink)"],
  ["aceptada", "var(--lime)"],
  ["rechazada", "var(--red)"],
];
const colorEstado = Object.fromEntries(ESTADOS);

const config = {
  titulo: "Propuestas",
  singular: "propuesta",
  femenino: true,
  api: propuestasApi,
  id: "id_propuesta",
  buscar: (p) => `${p.id_evento} ${p.estado} ${p.condiciones_acordadas ?? ""}`,
  columnas: [
    { titulo: "Evento", render: (p) => `Evento #${p.id_evento}` },
    { titulo: "Emisión", render: (p) => (p.fecha_emision ? fechaCorta(p.fecha_emision) : "—") },
    { titulo: "Total", render: (p) => moneda(p.total) },
    {
      titulo: "Estado",
      render: (p) => <span className="chip" style={{ "--c": colorEstado[p.estado] }}>{etiqueta(p.estado)}</span>,
    },
  ],
  campos: [
    { name: "id_evento", label: "ID del evento", type: "number", required: true, step: 1 },
    { name: "fecha_emision", label: "Fecha de emisión", type: "date" },
    { name: "total", label: "Total", type: "number" },
    {
      name: "estado", label: "Estado", type: "select", required: true, defecto: "borrador",
      options: ESTADOS.map(([value]) => ({ value, label: etiqueta(value) })),
    },
    { name: "condiciones_acordadas", label: "Condiciones acordadas", type: "textarea" },
    { name: "motivo_rechazo", label: "Motivo de rechazo", type: "textarea" },
  ],
};

export default function Propuestas() {
  return <PaginaCrud config={config} />;
}
