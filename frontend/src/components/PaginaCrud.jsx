import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, App, Button, Empty, Popconfirm, Space, Table, Tooltip } from "antd";
import { useMemo, useState } from "react";
import useRecurso from "../hooks/useRecurso.js";
import { fechaLarga } from "../utils/formato.js";
import FormModal from "./FormModal.jsx";
import Topbar from "./Topbar.jsx";

// Página de listado + alta/edición/baja para un recurso del back, con Ant Design (Table, Modal, Popconfirm).
// Cada sección simple (Clientes, Empresas, Propuestas, Tareas) es solo un objeto "config":
//   titulo    -> título de la página y del buscador ("Clientes")
//   singular  -> nombre en singular para los botones ("cliente"); femenino: true -> "Nueva"
//   api       -> cliente HTTP del recurso (carpeta api/)
//   id        -> nombre de la clave primaria en la base ("id_cliente")
//   columnas  -> [{ titulo, render(item) }] columnas de la tabla
//   campos    -> campos del formulario (ver FormModal)
//   buscar    -> (item) => texto sobre el que filtra el buscador
// Ejemplo completo en pages/Clientes.jsx. Estados internos:
//   busqueda -> texto del buscador | editando -> null, "nuevo" o el item que se edita
export default function PaginaCrud({ config }) {
  const { titulo, singular, femenino, api, id, columnas, campos, buscar } = config;
  const nuevo = `${femenino ? "Nueva" : "Nuevo"} ${singular}`;
  const { message } = App.useApp();
  const { items, cargando, error, recargar, guardar, eliminar } = useRecurso(api, id);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);

  // Filas que pasan el filtro del buscador.
  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => buscar(i).toLowerCase().includes(q));
  }, [items, busqueda, buscar]);

  // Si el back falla al eliminar, se avisa con un mensaje flotante de antd.
  const borrar = async (item) => {
    try {
      await eliminar(item);
      message.success("Registro eliminado");
    } catch (e) {
      message.error(e.message);
    }
  };

  // Columnas de la config + una última columna con las acciones.
  const columnasTabla = [
    ...columnas.map((c, i) => ({
      title: c.titulo,
      key: c.titulo,
      className: i === 0 ? "col-principal" : undefined,
      render: (_, item) => c.render(item),
    })),
    {
      key: "acciones",
      align: "right",
      render: (_, item) => (
        <Space size={4} wrap={false}>
          <Tooltip title="Editar">
            <Button type="text" icon={<EditOutlined />} aria-label="Editar" onClick={() => setEditando(item)} />
          </Tooltip>
          <Popconfirm
            title={`¿Eliminar este registro de ${titulo.toLowerCase()}?`}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            onConfirm={() => borrar(item)}
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
      <Topbar busqueda={busqueda} onBusqueda={setBusqueda} placeholder={`Buscar ${titulo.toLowerCase()}…`} />

      <div className="page-head">
        <div>
          <div className="eyebrow">{fechaLarga()}</div>
          <h1>{titulo}</h1>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setEditando("nuevo")}>
          {nuevo}
        </Button>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          title={error}
          action={
            <Button size="small" onClick={recargar}>
              Reintentar
            </Button>
          }
        />
      )}

      <div className="table-card">
        <div className="table-bar">
          <span className="muted">
            {cargando ? "Cargando…" : `${visibles.length} ${visibles.length === 1 ? "registro" : "registros"}`}
          </span>
          <Button size="small" icon={<ReloadOutlined />} onClick={recargar}>
            Actualizar
          </Button>
        </div>
        <Table
          rowKey={id}
          columns={columnasTabla}
          dataSource={visibles}
          loading={cargando}
          pagination={{ pageSize: 8, hideOnSinglePage: true, showSizeChanger: false }}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={busqueda ? "Sin resultados." : `Todavía no hay ${titulo.toLowerCase()}.`}
              />
            ),
          }}
        />
      </div>

      {editando && (
        <FormModal
          titulo={editando === "nuevo" ? nuevo : `Editar ${singular}`}
          campos={campos}
          item={editando === "nuevo" ? null : editando}
          onGuardar={(valores) => guardar(editando === "nuevo" ? null : editando, valores)}
          onCerrar={() => setEditando(null)}
        />
      )}
    </main>
  );
}
