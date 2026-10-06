import { useCallback, useEffect, useMemo, useState } from "react";
import { crearEmpresa, editarEmpresa, eliminarEmpresa, listarEmpresas } from "./api.js";
import EmpresaForm from "./components/EmpresaForm.jsx";
import ConfirmarEliminar from "./components/ConfirmarEliminar.jsx";
import Escena from "./components/Escena.jsx";
import LugarCard from "./components/LugarCard.jsx";
import Icon from "./components/Icon.jsx";
import { esDelMesActual, formatearFecha, iniciales, mapsUrl, paletaDe, telUrl } from "./utils.js";

const ORDENES = {
  reciente: { etiqueta: "Más recientes", fn: (a, b) => b.id_empresa - a.id_empresa },
  antiguo: { etiqueta: "Más antiguos", fn: (a, b) => a.id_empresa - b.id_empresa },
  nombre: { etiqueta: "Nombre A–Z", fn: (a, b) => a.nombre.localeCompare(b.nombre, "es") },
};

const FILTROS = {
  todos: { etiqueta: "Todos", fn: () => true },
  activos: { etiqueta: "Activos", fn: (e) => e.activo },
  inactivos: { etiqueta: "Inactivos", fn: (e) => !e.activo },
};

const leerVista = () => {
  try {
    return localStorage.getItem("vista") === "lista" ? "lista" : "tarjetas";
  } catch {
    return "tarjetas";
  }
};

export default function App() {
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [orden, setOrden] = useState("reciente");
  const [vista, setVista] = useState(leerVista);
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
    const t = setTimeout(() => setAviso(""), 3200);
    return () => clearTimeout(t);
  }, [aviso]);

  const cambiarVista = (v) => {
    setVista(v);
    try { localStorage.setItem("vista", v); } catch { /* sin almacenamiento: solo dura la sesión */ }
  };

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return empresas
      .filter(FILTROS[filtro].fn)
      .filter((e) => !q || [e.nombre, e.cuit, e.email, e.telefono, e.direccion].some((v) => v?.toLowerCase().includes(q)))
      .sort(ORDENES[orden].fn);
  }, [empresas, busqueda, filtro, orden]);

  const conteo = {
    todos: empresas.length,
    activos: empresas.filter((e) => e.activo).length,
    inactivos: empresas.filter((e) => !e.activo).length,
  };
  const nuevosMes = empresas.filter((e) => esDelMesActual(e.fecha_creacion)).length;

  const guardar = async (datos) => {
    const editando = formulario.empresa;
    if (editando) {
      const actualizada = await editarEmpresa(editando.id_empresa, datos);
      setEmpresas((prev) => prev.map((e) => (e.id_empresa === actualizada.id_empresa ? actualizada : e)));
      setAviso("Cambios guardados");
    } else {
      const nueva = await crearEmpresa(datos);
      setEmpresas((prev) => [...prev, nueva]);
      setAviso(`${nueva.nombre} ya está en la lista`);
    }
    setFormulario(null);
  };

  const eliminar = async () => {
    await eliminarEmpresa(aEliminar.id_empresa);
    setEmpresas((prev) => prev.filter((e) => e.id_empresa !== aEliminar.id_empresa));
    setAviso(`${aEliminar.nombre} fue eliminado`);
    setAEliminar(null);
  };

  const abrirNuevo = () => setFormulario({ empresa: null });

  const stats = [
    { icono: "building", etiqueta: "Lugares", valor: conteo.todos },
    { icono: "bolt", etiqueta: "Activos", valor: conteo.activos },
    { icono: "pause", etiqueta: "Inactivos", valor: conteo.inactivos },
    { icono: "sparkles", etiqueta: "Nuevos este mes", valor: nuevosMes },
  ];

  return (
    <>
      <Escena />

      <header className="nav">
        <div className="nav-inner glass">
          <a className="marca" href="/">
            <span className="marca-logo"><Icon name="sparkles" size={18} /></span>
            <span className="marca-texto">Boliches <em>&amp;</em> Eventos</span>
          </a>
          <div className="nav-der">
            <span className={`estado ${error ? "off" : cargando ? "espera" : "on"}`}>
              <span className="punto" />
              {error ? "Sin conexión" : cargando ? "Conectando…" : "En línea"}
            </span>
            <button className="btn primario solo-desktop" onClick={abrirNuevo}>
              <Icon name="plus" /> Agregar lugar
            </button>
          </div>
        </div>
      </header>

      <main className="contenedor">
        <section className="hero">
          <p className="eyebrow">Panel de gestión · Noche &amp; eventos</p>
          <h1>
            Tu noche,<br />
            <span className="brillo">bien organizada.</span>
          </h1>
          <p className="hero-sub">
            Boliches, productoras y salones de fiesta en un solo lugar: contacto, CUIT y estado de cada uno.
          </p>
        </section>

        <section className="stats" aria-label="Resumen">
          {stats.map((s) => (
            <div key={s.etiqueta} className="stat glass">
              <span className="stat-icono"><Icon name={s.icono} size={20} /></span>
              <div>
                <span className="stat-label">{s.etiqueta}</span>
                <b className="stat-num">{cargando || error ? "—" : s.valor}</b>
              </div>
            </div>
          ))}
        </section>

        <div className="toolbar glass">
          <label className="buscador">
            <Icon name="search" />
            <input
              type="search"
              placeholder="Buscar por nombre, CUIT, teléfono…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar lugares"
            />
            {busqueda && (
              <button className="limpiar" onClick={() => setBusqueda("")} aria-label="Borrar búsqueda">
                <Icon name="x" size={16} />
              </button>
            )}
          </label>

          <div className="segmentado" role="group" aria-label="Filtrar por estado">
            {Object.entries(FILTROS).map(([clave, { etiqueta }]) => (
              <button key={clave} aria-pressed={filtro === clave} onClick={() => setFiltro(clave)}>
                {etiqueta} <span className="cuenta">{conteo[clave]}</span>
              </button>
            ))}
          </div>

          <select className="orden" value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar">
            {Object.entries(ORDENES).map(([clave, { etiqueta }]) => (
              <option key={clave} value={clave}>{etiqueta}</option>
            ))}
          </select>

          <div className="vistas" role="group" aria-label="Vista">
            <button aria-pressed={vista === "tarjetas"} onClick={() => cambiarVista("tarjetas")} aria-label="Ver como tarjetas" title="Tarjetas">
              <Icon name="grid" />
            </button>
            <button aria-pressed={vista === "lista"} onClick={() => cambiarVista("lista")} aria-label="Ver como lista" title="Lista">
              <Icon name="list" />
            </button>
          </div>
        </div>

        {!cargando && !error && empresas.length > 0 && (
          <p className="meta" aria-live="polite">
            {visibles.length === empresas.length
              ? `${empresas.length} ${empresas.length === 1 ? "lugar" : "lugares"}`
              : `${visibles.length} de ${empresas.length} lugares`}
          </p>
        )}

        {error && (
          <div className="estado-vacio glass" role="alert">
            <span className="vacio-icono rojo"><Icon name="alert" size={26} /></span>
            <h2>No pudimos conectar con el servidor</h2>
            <p>{error}</p>
            <button className="btn" onClick={cargar}><Icon name="refresh" /> Reintentar</button>
          </div>
        )}

        {cargando && (
          <div className="grilla" aria-busy="true" aria-label="Cargando lugares">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="lugar glass esqueleto">
                <div className="lugar-poster" />
                <div className="lugar-cuerpo">
                  <span className="linea l1" /><span className="linea l2" /><span className="linea l3" /><span className="linea l3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!cargando && !error && visibles.length === 0 && (
          <div className="estado-vacio glass">
            <span className="vacio-icono"><Icon name={empresas.length ? "search" : "sparkles"} size={26} /></span>
            {empresas.length ? (
              <>
                <h2>Nada coincide</h2>
                <p>Probá con otro nombre o sacá los filtros.</p>
                <button className="btn" onClick={() => { setBusqueda(""); setFiltro("todos"); }}>Limpiar filtros</button>
              </>
            ) : (
              <>
                <h2>La pista está vacía</h2>
                <p>Cargá el primer boliche, productora o salón.</p>
                <button className="btn primario" onClick={abrirNuevo}><Icon name="plus" /> Agregar lugar</button>
              </>
            )}
          </div>
        )}

        {!cargando && !error && visibles.length > 0 && (vista === "tarjetas" ? (
          <div className="grilla">
            {visibles.map((e, i) => (
              <LugarCard
                key={e.id_empresa}
                lugar={e}
                indice={i}
                onEditar={() => setFormulario({ empresa: e })}
                onEliminar={() => setAEliminar(e)}
              />
            ))}
          </div>
        ) : (
          <div className="lista glass">
            <table>
              <thead>
                <tr>
                  <th scope="col">Lugar</th>
                  <th scope="col">CUIT</th>
                  <th scope="col">Teléfono</th>
                  <th scope="col">Dirección</th>
                  <th scope="col">Alta</th>
                  <th scope="col"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((e) => {
                  const [c1, c2] = paletaDe(e.nombre);
                  return (
                    <tr key={e.id_empresa}>
                      <td>
                        <div className="fila-lugar">
                          <span className="avatar" style={{ "--c1": c1, "--c2": c2 }}>{iniciales(e.nombre)}</span>
                          <div>
                            <div className="fila-nombre">
                              {e.nombre}
                              <span className={`chip-estado mini ${e.activo ? "on" : "off"}`}><span className="punto" />{e.activo ? "Activo" : "Inactivo"}</span>
                            </div>
                            {e.email ? <a className="fila-sub" href={`mailto:${e.email}`}>{e.email}</a> : <span className="fila-sub dato-vacio">Sin email</span>}
                          </div>
                        </div>
                      </td>
                      <td className="num" data-label="CUIT">{e.cuit}</td>
                      <td className="num" data-label="Teléfono">{e.telefono ? <a href={telUrl(e.telefono)}>{e.telefono}</a> : <span className="dato-vacio">—</span>}</td>
                      <td data-label="Dirección">{e.direccion ? <a href={mapsUrl(e.direccion)} target="_blank" rel="noopener noreferrer">{e.direccion}</a> : <span className="dato-vacio">—</span>}</td>
                      <td className="num" data-label="Alta">{formatearFecha(e.fecha_creacion)}</td>
                      <td className="fila-acciones">
                        <button className="btn-icono" onClick={() => setFormulario({ empresa: e })} aria-label={`Editar ${e.nombre}`} title="Editar"><Icon name="edit" /></button>
                        <button className="btn-icono peligro" onClick={() => setAEliminar(e)} aria-label={`Eliminar ${e.nombre}`} title="Eliminar"><Icon name="trash" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </main>

      <button className="fab" onClick={abrirNuevo} aria-label="Agregar lugar">
        <Icon name="plus" size={24} />
      </button>

      {aviso && (
        <div className="toast glass" role="status">
          <span className="toast-icono"><Icon name="check" size={16} /></span>
          {aviso}
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
    </>
  );
}
