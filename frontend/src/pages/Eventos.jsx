import { useMemo, useState } from "react";
import FormModal from "../components/FormModal.jsx";
import Topbar from "../components/Topbar.jsx";
import { eventosApi } from "../api/eventos.js";
import { useAuth } from "../context/AuthContext.jsx";
import useRecurso from "../hooks/useRecurso.js";
import { diasHasta, etiqueta, fechaCorta, fechaLarga, hoyISO, soloFecha } from "../utils/formato.js";

const ESTADOS = {
  recibida: "var(--amber)",
  en_evaluacion: "var(--cyan)",
  propuesta_enviada: "var(--violet)",
  aceptada: "var(--lime)",
  rechazada: "var(--red)",
  confirmado: "var(--lime)",
  preparacion: "var(--pink)",
  realizado: "var(--muted)",
  cancelado: "var(--red)",
};
const PALETA = ["var(--pink)", "var(--cyan)", "var(--violet)", "var(--lime)", "var(--amber)"];
const colorDe = (e) => PALETA[e.id_evento % PALETA.length];

const CERRADOS = ["realizado", "cancelado", "rechazada"];
const BORRADORES = ["recibida", "en_evaluacion", "propuesta_enviada"];

const FILTROS = [
  { id: "proximos", label: "Próximos", test: (e, hoy) => !CERRADOS.includes(e.estado) && !BORRADORES.includes(e.estado) && (!e.fecha || soloFecha(e.fecha) >= hoy) },
  { id: "borradores", label: "Borradores", test: (e) => BORRADORES.includes(e.estado) },
  { id: "pasados", label: "Pasados", test: (e, hoy) => CERRADOS.includes(e.estado) || (e.fecha && soloFecha(e.fecha) < hoy && !BORRADORES.includes(e.estado)) },
];

// Lunes a domingo de la semana actual, como "YYYY-MM-DD".
function semanaActual() {
  const hoy = new Date();
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - ((hoy.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { iso, dia: d.getDate() };
  });
}

const Estado = ({ estado, className }) => (
  <span className={`chip ${className ?? ""}`} style={{ "--c": ESTADOS[estado] ?? "var(--muted)" }}>
    {etiqueta(estado)}
  </span>
);

export default function Eventos() {
  const { usuario } = useAuth();
  const { items, cargando, error, recargar, guardar, eliminar } = useRecurso(eventosApi, "id_evento");
  const [filtro, setFiltro] = useState("proximos");
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);
  const [errorAccion, setErrorAccion] = useState("");
  const [aviso, setAviso] = useState("");

  const hoy = hoyISO();
  const semana = useMemo(semanaActual, []);

  const campos = useMemo(() => [
    { name: "tipo_evento", label: "Nombre / tipo de evento", required: true, full: true },
    { name: "id_cliente", label: "ID del cliente", type: "number", required: true, step: 1 },
    { name: "fecha", label: "Fecha", type: "date" },
    { name: "sede_prevista", label: "Sala / sede" },
    { name: "cant_asistentes_estimada", label: "Capacidad estimada", type: "number", step: 1 },
    {
      name: "estado", label: "Estado", type: "select", required: true, defecto: "recibida",
      options: Object.keys(ESTADOS).map((value) => ({ value, label: etiqueta(value) })),
    },
    {
      name: "estado_sede", label: "Estado de la sede", type: "select", required: true, defecto: "pendiente",
      options: [{ value: "pendiente", label: "Pendiente" }, { value: "confirmada", label: "Confirmada" }],
    },
    { name: "id_organizador", label: "ID del organizador", type: "number", step: 1, defecto: usuario?.id_personal },
    { name: "necesidades_preferencias", label: "Necesidades y preferencias", type: "textarea" },
  ], [usuario?.id_personal]);

  const q = busqueda.trim().toLowerCase();
  const buscados = items.filter((e) => !q || `${e.tipo_evento} ${e.sede_prevista ?? ""}`.toLowerCase().includes(q));
  const lista = buscados
    .filter((e) => FILTROS.find((f) => f.id === filtro).test(e, hoy))
    .sort((a, b) => (soloFecha(a.fecha) || "9999").localeCompare(soloFecha(b.fecha) || "9999"));

  const destacado = items
    .filter((e) => e.fecha && soloFecha(e.fecha) >= hoy && !CERRADOS.includes(e.estado))
    .sort((a, b) => soloFecha(a.fecha).localeCompare(soloFecha(b.fecha)))[0];
  const dias = destacado ? diasHasta(destacado.fecha) : null;

  const deLaSemana = items
    .filter((e) => e.fecha && semana.some((d) => d.iso === soloFecha(e.fecha)) && !CERRADOS.includes(e.estado))
    .sort((a, b) => soloFecha(a.fecha).localeCompare(soloFecha(b.fecha)));
  const colorPorDia = Object.fromEntries(deLaSemana.map((e) => [soloFecha(e.fecha), colorDe(e)]));

  const borrar = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.tipo_evento}"?`)) return;
    setErrorAccion("");
    try {
      await eliminar(item);
    } catch (e) {
      setErrorAccion(e.message);
    }
  };

  // Enlace único del evento: el cliente lo abre sin cuenta para ver su propuesta y responderla.
  const copiarLink = async (item) => {
    const url = `${window.location.origin}/evento/${item.token_publico}`;
    setErrorAccion("");
    try {
      await navigator.clipboard.writeText(url);
      setAviso(`Link copiado: ${url}`);
    } catch {
      window.prompt("Copiá el link del evento", url);
    }
  };

  return (
    <main className="main">
      <Topbar busqueda={busqueda} onBusqueda={setBusqueda} placeholder="Buscar eventos…" />

      <div className="page-head">
        <div>
          <div className="eyebrow">{fechaLarga()}</div>
          <h1>Eventos</h1>
        </div>
        <button className="btn" onClick={() => setEditando("nuevo")}>+ Nuevo evento</button>
      </div>

      {errorAccion && <div className="form-error">{errorAccion}</div>}
      {aviso && <div className="form-ok">{aviso}</div>}

      <div className="dash">
        <div className="hero">
          {destacado ? (
            <>
              <div className="hero-top">
                <span className="eyebrow">
                  PRÓXIMO · {dias === 0 ? "HOY" : dias === 1 ? "MAÑANA" : `EN ${dias} DÍAS`}
                </span>
                <Estado estado={destacado.estado} />
              </div>
              <div>
                <h2>{destacado.tipo_evento}</h2>
                <p>
                  {fechaCorta(destacado.fecha)}
                  {destacado.sede_prevista ? ` · ${destacado.sede_prevista}` : ""}
                </p>
              </div>
              <div className="hero-foot">
                {destacado.cant_asistentes_estimada
                  ? `${Number(destacado.cant_asistentes_estimada).toLocaleString("es-AR")} asistentes estimados`
                  : "Sin capacidad estimada"}
              </div>
            </>
          ) : (
            <>
              <span className="eyebrow">PRÓXIMO</span>
              <h2 className="muted">{cargando ? "Cargando…" : "Sin eventos a la vista"}</h2>
              <div className="hero-foot">Creá un evento con fecha para verlo acá.</div>
            </>
          )}
        </div>

        <div className="card week">
          <b>Esta semana</b>
          <div className="week-grid names">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div className="week-grid days">
            {semana.map((d) => {
              const color = colorPorDia[d.iso];
              const estilo = color ? { background: color, color: "var(--bg)" } : undefined;
              const clase = d.iso === hoy ? "today" : d.iso < hoy ? "past" : "";
              return <span key={d.iso} className={clase} style={estilo}>{d.dia}</span>;
            })}
          </div>
          <div className="week-list">
            {deLaSemana.length === 0 && <span className="muted">Sin eventos esta semana.</span>}
            {deLaSemana.map((e) => (
              <div key={e.id_evento}>
                <span className="dot" style={{ background: colorDe(e) }} />
                {e.tipo_evento}
                <em>{fechaCorta(e.fecha).split(" ")[0]}</em>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-bar">
          <div className="seg">
            {FILTROS.map((f) => (
              <button key={f.id} className={filtro === f.id ? "on" : ""} onClick={() => setFiltro(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
          <span className="muted" style={{ fontSize: 13 }}>
            {cargando ? "Cargando…" : `${lista.length} ${lista.length === 1 ? "evento" : "eventos"}`}
          </span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {["EVENTO", "FECHA", "SALA", "CAPACIDAD", "ORGANIZA", "ESTADO"].map((t) => <th key={t}>{t}</th>)}
                <th />
              </tr>
            </thead>
            <tbody>
              {lista.map((e) => (
                <tr key={e.id_evento}>
                  <td className="first">
                    <span className="bar-name" style={{ "--c": colorDe(e) }}>
                      <i />
                      {e.tipo_evento}
                    </span>
                  </td>
                  <td>{e.fecha ? fechaCorta(e.fecha) : "Sin fecha"}</td>
                  <td>{e.sede_prevista ?? "—"}</td>
                  <td>{e.cant_asistentes_estimada != null ? Number(e.cant_asistentes_estimada).toLocaleString("es-AR") : "—"}</td>
                  <td>
                    {e.id_organizador == null ? "—" : e.id_organizador === usuario?.id_personal ? "Vos" : `Personal #${e.id_organizador}`}
                  </td>
                  <td><Estado estado={e.estado} /></td>
                  <td className="actions">
                    {e.token_publico && <button onClick={() => copiarLink(e)}>Link</button>}
                    <button onClick={() => setEditando(e)}>Editar</button>
                    <button className="del" onClick={() => borrar(e)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && (
          <div className="estado err">
            {error}{" "}
            <button className="btn btn--ghost btn--sm" onClick={recargar}>Reintentar</button>
          </div>
        )}
        {!cargando && !error && lista.length === 0 && (
          <div className="estado">{busqueda ? "Sin resultados." : "No hay eventos en esta vista."}</div>
        )}
      </div>

      {editando && (
        <FormModal
          titulo={editando === "nuevo" ? "Nuevo evento" : "Editar evento"}
          campos={campos}
          item={editando === "nuevo" ? null : editando}
          onGuardar={(valores) => guardar(editando === "nuevo" ? null : editando, valores)}
          onCerrar={() => setEditando(null)}
        />
      )}
    </main>
  );
}
