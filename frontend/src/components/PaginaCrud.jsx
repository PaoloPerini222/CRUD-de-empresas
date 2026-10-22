import { useMemo, useState } from "react";
import useRecurso from "../hooks/useRecurso.js";
import { fechaLarga } from "../utils/formato.js";
import FormModal from "./FormModal.jsx";
import Topbar from "./Topbar.jsx";

// Página de listado + alta/edición/baja para un recurso del back.
// config: { titulo, singular, api, id, columnas: [{ titulo, render(item) }], campos, buscar(item) -> texto, defectos }
export default function PaginaCrud({ config }) {
  const { titulo, singular, femenino, api, id, columnas, campos, buscar } = config;
  const nuevo = `${femenino ? "Nueva" : "Nuevo"} ${singular}`;
  const { items, cargando, error, recargar, guardar, eliminar } = useRecurso(api, id);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null); // null | "nuevo" | item
  const [errorAccion, setErrorAccion] = useState("");

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => buscar(i).toLowerCase().includes(q));
  }, [items, busqueda, buscar]);

  const borrar = async (item) => {
    if (!window.confirm(`¿Eliminar este registro de ${titulo.toLowerCase()}?`)) return;
    setErrorAccion("");
    try {
      await eliminar(item);
    } catch (e) {
      setErrorAccion(e.message);
    }
  };

  return (
    <main className="main">
      <Topbar busqueda={busqueda} onBusqueda={setBusqueda} placeholder={`Buscar ${titulo.toLowerCase()}…`} />
      <div className="page-head">
        <div>
          <div className="eyebrow">{fechaLarga()}</div>
          <h1>{titulo}</h1>
        </div>
        <button className="btn" onClick={() => setEditando("nuevo")}>+ {nuevo}</button>
      </div>

      {errorAccion && <div className="form-error">{errorAccion}</div>}

      <div className="table-card">
        <div className="table-bar">
          <span className="muted" style={{ fontSize: 13 }}>
            {cargando ? "Cargando…" : `${visibles.length} ${visibles.length === 1 ? "registro" : "registros"}`}
          </span>
          <button className="btn btn--ghost btn--sm" onClick={recargar}>Actualizar</button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {columnas.map((c) => <th key={c.titulo}>{c.titulo.toUpperCase()}</th>)}
                <th />
              </tr>
            </thead>
            <tbody>
              {visibles.map((item) => (
                <tr key={item[id]}>
                  {columnas.map((c, i) => (
                    <td key={c.titulo} className={i === 0 ? "first" : ""}>{c.render(item)}</td>
                  ))}
                  <td className="actions">
                    <button onClick={() => setEditando(item)}>Editar</button>
                    <button className="del" onClick={() => borrar(item)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && <div className="estado err">{error}</div>}
        {!cargando && !error && visibles.length === 0 && (
          <div className="estado">{busqueda ? "Sin resultados." : `Todavía no hay ${titulo.toLowerCase()}.`}</div>
        )}
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
