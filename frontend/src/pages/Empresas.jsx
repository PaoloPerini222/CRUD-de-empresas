import PaginaCrud from "../components/PaginaCrud.jsx";
import { empresasApi } from "../api/empresas.js";

const config = {
  titulo: "Empresas",
  singular: "empresa",
  femenino: true,
  api: empresasApi,
  id: "id_empresa",
  buscar: (e) => `${e.nombre} ${e.cuit} ${e.email ?? ""}`,
  puedeCrear: (p) => p.esSuperadmin,
  puedeEditar: (p) => p.esSuperadmin,
  columnas: [
    { titulo: "Empresa", render: (e) => e.nombre },
    { titulo: "CUIT", render: (e) => e.cuit },
    { titulo: "Email", render: (e) => e.email ?? "—" },
    { titulo: "Teléfono", render: (e) => e.telefono ?? "—" },
    { titulo: "Dirección", render: (e) => e.direccion ?? "—" },
  ],
  campos: [
    { name: "nombre", label: "Nombre", required: true, full: true },
    { name: "cuit", label: "CUIT", required: true },
    { name: "telefono", label: "Teléfono" },
    { name: "email", label: "Email", type: "email", full: true },
    { name: "direccion", label: "Dirección", full: true },
  ],
};

export default function Empresas() {
  return <PaginaCrud config={config} />;
}
