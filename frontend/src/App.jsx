import { useCallback, useEffect, useMemo, useState } from "react";
import { crearEmpresa, editarEmpresa, eliminarEmpresa, listarEmpresas } from "./api.js";
import EmpresaForm from "./components/EmpresaForm.jsx";
import ConfirmarEliminar from "./components/ConfirmarEliminar.jsx";
import { formatearFecha, iniciales } from "./utils.js";

const ORDENES = {
  id: { etiqueta: "Más antiguas", fn: (a, b) => a.id_empresa - b.id_empresa },
  reciente: { etiqueta: "Más recientes", fn: (a, b) => b.id_empresa - a.id_empresa },
  nombre: { etiqueta: "Nombre (A-Z)", fn: (a, b) => a.nombre.localeCompare(b.nombre, "es") },
};

export default function App() {
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("id");
  const [formulario, setFormulario] = useState(null); // { empresa } | null
  const [aEliminar, setAEliminar] = useState(null);
  const [aviso, setAviso] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      setEmpresas(await listarEmpresas());
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(""), 3500);
    return () => clearTimeout(t);
  }, [aviso]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtradas = q
      ? empresas.filter((e) =>
          [e.nombre, e.cuit, e.email, e.telefono, e.direccion].some((v) => v?.toLowerCase().includes(q))
        )
      : empresas;
    return [...filtradas].sort(ORDENES[orden].fn);
  }, [empresas, busqueda, orden]);

  const guardar = async (datos) => {
    const editando = formulario.empresa;
    if (editando) {
      const actualizada = await editarEmpresa(editando.id_empresa, datos);
      setEmpresas((prev) => prev.map((e) => (e.id_empresa === actualizada.id_empresa ? actualizada : e)));
      setAviso("Empresa actualizada");
    } else {
      const nueva = await crearEmpresa(datos);
      setEmpresas((prev) => [...prev, nueva]);
      setAviso("Empresa creada");
    }
    setFormulario(null);
  };

  const eliminar = async () => {
    await eliminarEmpresa(aEliminar.id_empresa);
    setEmpresas((prev) => prev.filter((e) => e.id_empresa !== aEliminar.id_empresa));
    setAEliminar(null);
    setAviso("Empresa eliminada");
  };

  const activas = empresas.filter((e) => e.activo).length;

  return (
    <div className="app">
      <header className="cabecera">
        <div>
          <h1>Empresas</h1>
          <p className="sub">Administrá las empresas del sistema de eventos.</p>
        </div>
        <button className="btn primario" onClick={() => setFormulario({ empresa: null })}>
          + Nueva empresa
        </button>
      </header>

      <section className="resumen" aria-label="Resumen">
        <div className="stat"><span>Total</span><b>{empresas.length}</b></div>
        <div className="stat"><span>Activas</span><b>{activas}</b></div>
        <div className="stat"><span>Inactivas</span><b>{empresas.length - activas}</b></div>
      </section>

      <div className="barra">
        <input
          className="buscador"
          type="search"
          placeholder="Buscar empresa, CUIT, email…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar empresas"
        />
        <select value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar por">
          {Object.entries(ORDENES).map(([clave, { etiqueta }]) => (
            <option key={clave} value={clave}>{etiqueta}</option>
          ))}
        </select>
      </div>

      {aviso && <div className="toast" role="status">{aviso}</div>}

      {error && (
        <div className="alerta error" role="alert">
          {error} <button className="link" onClick={cargar}>Reintentar</button>
        </div>
      )}

      {cargando && <div className="vacio"><div className="spinner" /> Cargando empresas…</div>}

      {!cargando && !error && visibles.length === 0 && (
        <div className="vacio">
          {empresas.length === 0 ? "Todavía no hay empresas cargadas." : "Ninguna empresa coincide con la búsqueda."}
        </div>
      )}

      {!cargando && visibles.length > 0 && (
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>CUIT</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Alta</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {visibles.map((e) => (
                <tr key={e.id_empresa}>
                  <td data-label="Empresa">
                    <div className="empresa">
                      <span className="avatar">{iniciales(e.nombre)}</span>
                      <div>
                        <div className="nombre">
                          {e.nombre}
                          {!e.activo && <span className="chip">Inactiva</span>}
                        </div>
                        <div className="muted">{e.email || "Sin email"}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="CUIT" className="mono">{e.cuit}</td>
                  <td data-label="Teléfono" className="mono">{e.telefono || "—"}</td>
                  <td data-label="Dirección">{e.direccion || "—"}</td>
                  <td data-label="Alta">{formatearFecha(e.fecha_creacion)}</td>
                  <td className="celda-acciones">
                    <button className="btn chico" onClick={() => setFormulario({ empresa: e })}>Editar</button>
                    <button className="btn chico peligro-suave" onClick={() => setAEliminar(e)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formulario && (
        <EmpresaForm
          empresa={formulario.empresa}
          empresas={empresas}
          onGuardar={guardar}
          onCerrar={() => setFormulario(null)}
        />
      )}
      {aEliminar && (
        <ConfirmarEliminar empresa={aEliminar} onConfirmar={eliminar} onCerrar={() => setAEliminar(null)} />
      )}
    </div>
  );
}
