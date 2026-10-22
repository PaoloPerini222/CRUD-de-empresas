import { DeleteOutlined, EditOutlined, LinkOutlined, PlusOutlined } from "@ant-design/icons";
import { Alert, App, Button, Card, Empty, Popconfirm, Segmented, Skeleton, Space, Table, Tooltip } from "antd";
import { useMemo, useState } from "react";
import { eventosApi } from "../api/eventos.js";
import Estado from "../components/Estado.jsx";
import FormModal from "../components/FormModal.jsx";
import Topbar from "../components/Topbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import useRecurso from "../hooks/useRecurso.js";
import { diasHasta, etiqueta, fechaCorta, fechaLarga, hoyISO, soloFecha } from "../utils/formato.js";

// Pantalla principal del panel: tablero con el próximo evento, la semana actual y la tabla de eventos.
// No usa PaginaCrud porque tiene más cosas (filtros, calendario semanal, link público).

// Estado del evento -> color de su etiqueta.
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

// Colores que se reparten entre eventos (barra de la tabla, día del calendario).
const PALETA = ["var(--pink)", "var(--cyan)", "var(--violet)", "var(--lime)", "var(--amber)"];
const colorDe = (e) => PALETA[e.id_evento % PALETA.length];

// Un evento "cerrado" ya no cuenta como próximo; un "borrador" todavía no está confirmado.
const CERRADOS = ["realizado", "cancelado", "rechazada"];
const BORRADORES = ["recibida", "en_evaluacion", "propuesta_enviada"];

// Pestañas de la tabla. test(evento, hoy) decide si el evento entra en esa pestaña.
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

export default function Eventos() {
  const { usuario } = useAuth();
  const { message } = App.useApp();
  const { items, cargando, error, recargar, guardar, eliminar } = useRecurso(eventosApi, "id_evento");
  const [filtro, setFiltro] = useState("proximos");
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null); // null | "nuevo" | evento

  const hoy = hoyISO();
  const semana = useMemo(semanaActual, []);

  // Campos del formulario de alta/edición (el organizador por defecto es el usuario actual).
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

  // Cálculos de pantalla, de arriba hacia abajo:
  //   lista     -> filas de la tabla (búsqueda + pestaña activa, ordenadas por fecha)
  //   destacado -> próximo evento futuro, para la tarjeta grande
  //   deLaSemana / colorPorDia -> eventos de esta semana, para el calendario
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
    try {
      await eliminar(item);
      message.success("Evento eliminado");
    } catch (e) {
      message.error(e.message);
    }
  };

  // Enlace único del evento: el cliente lo abre sin cuenta para ver su propuesta y responderla.
  const copiarLink = async (item) => {
    const url = `${window.location.origin}/evento/${item.token_publico}`;
    try {
      await navigator.clipboard.writeText(url);
      message.success(`Link copiado: ${url}`);
    } catch {
      window.prompt("Copiá el link del evento", url);
    }
  };

  const columnas = [
    {
      title: "Evento",
      key: "evento",
      className: "col-principal",
      render: (_, e) => (
        <span className="bar-name" style={{ "--c": colorDe(e) }}>
          <i />
          {e.tipo_evento}
        </span>
      ),
    },
    { title: "Fecha", key: "fecha", render: (_, e) => (e.fecha ? fechaCorta(e.fecha) : "Sin fecha") },
    { title: "Sala", key: "sala", render: (_, e) => e.sede_prevista ?? "—" },
    {
      title: "Capacidad",
      key: "capacidad",
      render: (_, e) => (e.cant_asistentes_estimada != null ? Number(e.cant_asistentes_estimada).toLocaleString("es-AR") : "—"),
    },
    {
      title: "Organiza",
      key: "organiza",
      render: (_, e) => (e.id_organizador == null ? "—" : e.id_organizador === usuario?.id_personal ? "Vos" : `Personal #${e.id_organizador}`),
    },
    { title: "Estado", key: "estado", render: (_, e) => <Estado estado={e.estado} color={ESTADOS[e.estado]} /> },
    {
      key: "acciones",
      align: "right",
      render: (_, e) => (
        <Space size={4} wrap={false}>
          {e.token_publico && (
            <Tooltip title="Copiar el enlace para el cliente">
              <Button type="text" icon={<LinkOutlined />} aria-label="Copiar enlace" onClick={() => copiarLink(e)} />
            </Tooltip>
          )}
          <Tooltip title="Editar">
            <Button type="text" icon={<EditOutlined />} aria-label="Editar" onClick={() => setEditando(e)} />
          </Tooltip>
          <Popconfirm
            title={`¿Eliminar "${e.tipo_evento}"?`}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            onConfirm={() => borrar(e)}
          >
            <Tooltip title="Eliminar">
              <Button type="text" danger icon={<DeleteOutlined />} aria-label="Eliminar" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <main className="main">
      <Topbar busqueda={busqueda} onBusqueda={setBusqueda} placeholder="Buscar eventos…" />

      <div className="page-head">
        <div>
          <div className="eyebrow">{fechaLarga()}</div>
          <h1>Eventos</h1>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setEditando("nuevo")}>
          Nuevo evento
        </Button>
      </div>

      <div className="dash">
        {/* Tarjeta grande: el próximo evento. */}
        <Card variant="borderless" className="hero">
          {cargando && !items.length ? (
            <Skeleton active paragraph={{ rows: 2 }} />
          ) : destacado ? (
            <>
              <div className="hero-top">
                <span className="eyebrow">PRÓXIMO · {dias === 0 ? "HOY" : dias === 1 ? "MAÑANA" : `EN ${dias} DÍAS`}</span>
                <Estado estado={destacado.estado} color={ESTADOS[destacado.estado]} />
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
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <>
                  <b>Sin eventos a la vista</b>
                  <br />
                  Creá un evento con fecha para verlo acá.
                </>
              }
            />
          )}
        </Card>

        {/* Calendario de la semana: los días con evento se pintan y muestran su nombre al pasar el mouse. */}
        <Card variant="borderless" className="week" title="Esta semana">
          <div className="week-grid names">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div className="week-grid days">
            {semana.map((d) => {
              const color = colorPorDia[d.iso];
              const estilo = color ? { background: color, color: "var(--on-primary)" } : undefined;
              const clase = d.iso === hoy ? "today" : d.iso < hoy ? "past" : "";
              const nombres = deLaSemana.filter((e) => soloFecha(e.fecha) === d.iso).map((e) => e.tipo_evento).join(", ");
              return (
                <Tooltip key={d.iso} title={nombres || undefined}>
                  <span className={clase} style={estilo}>{d.dia}</span>
                </Tooltip>
              );
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
        </Card>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          title={error}
          action={<Button size="small" onClick={recargar}>Reintentar</Button>}
        />
      )}

      <div className="table-card">
        <div className="table-bar">
          <Segmented
            value={filtro}
            onChange={setFiltro}
            options={FILTROS.map((f) => ({ label: f.label, value: f.id }))}
          />
          <span className="muted">
            {cargando ? "Cargando…" : `${lista.length} ${lista.length === 1 ? "evento" : "eventos"}`}
          </span>
        </div>
        <Table
          rowKey="id_evento"
          columns={columnas}
          dataSource={lista}
          loading={cargando}
          pagination={{ pageSize: 8, hideOnSinglePage: true, showSizeChanger: false }}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={busqueda ? "Sin resultados." : "No hay eventos en esta vista."} />
            ),
          }}
        />
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
