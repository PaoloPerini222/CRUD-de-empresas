import { useState } from "react";
import Modal from "./Modal.jsx";
import { cuitValido, emailValido, formatearCuit } from "../utils.js";

const VACIO = { nombre: "", cuit: "", email: "", telefono: "", direccion: "" };

export default function EmpresaForm({ empresa, empresas, onGuardar, onCerrar }) {
  const editando = Boolean(empresa);
  const [datos, setDatos] = useState(
    editando
      ? {
          nombre: empresa.nombre,
          cuit: empresa.cuit,
          email: empresa.email ?? "",
          telefono: empresa.telefono ?? "",
          direccion: empresa.direccion ?? "",
        }
      : VACIO
  );
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cambiar = (campo) => (e) => {
    const valor = campo === "cuit" ? formatearCuit(e.target.value) : e.target.value;
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((er) => ({ ...er, [campo]: undefined }));
  };

  const validar = () => {
    const er = {};
    if (!datos.nombre.trim()) er.nombre = "El nombre es obligatorio";
    if (!datos.cuit.trim()) er.cuit = "El CUIT es obligatorio";
    else if (!cuitValido(datos.cuit)) er.cuit = "Formato esperado: 30-12345678-9";
    else if (empresas.some((e) => e.cuit === datos.cuit && e.id_empresa !== empresa?.id_empresa))
      er.cuit = "Ya existe una empresa con ese CUIT";
    if (datos.email.trim() && !emailValido(datos.email.trim())) er.email = "Email inválido";
    return er;
  };

  const enviar = async (e) => {
    e.preventDefault();
    const er = validar();
    setErrores(er);
    if (Object.keys(er).length) return;

    setGuardando(true);
    setErrorServidor("");
    try {
      await onGuardar({
        nombre: datos.nombre.trim(),
        cuit: datos.cuit.trim(),
        email: datos.email.trim() || null,
        telefono: datos.telefono.trim() || null,
        direccion: datos.direccion.trim() || null,
      });
    } catch (err) {
      setErrorServidor(err.message);
      setGuardando(false);
    }
  };

  const campo = (id, etiqueta, props = {}) => (
    <div className={`campo ${props.ancho ? "ancho" : ""}`}>
      <label htmlFor={id}>
        {etiqueta} {props.obligatorio && <span className="req">*</span>}
      </label>
      <input
        id={id}
        value={datos[id]}
        onChange={cambiar(id)}
        aria-invalid={Boolean(errores[id])}
        maxLength={props.max}
        placeholder={props.placeholder}
        type={props.type || "text"}
        inputMode={props.inputMode}
        autoFocus={props.autoFocus}
      />
      {errores[id] && <p className="error-campo">{errores[id]}</p>}
    </div>
  );

  return (
    <Modal titulo={editando ? "Editar empresa" : "Nueva empresa"} onCerrar={onCerrar}>
      <form onSubmit={enviar} noValidate>
        <div className="grid-form">
          {campo("nombre", "Nombre", { obligatorio: true, max: 150, placeholder: "Eventos del Centro", ancho: true, autoFocus: true })}
          {campo("cuit", "CUIT", { obligatorio: true, max: 13, placeholder: "30-12345678-9", inputMode: "numeric" })}
          {campo("telefono", "Teléfono", { max: 30, placeholder: "351-4001122", inputMode: "tel" })}
          {campo("email", "Email", { max: 150, placeholder: "contacto@empresa.com", type: "email", ancho: true })}
          {campo("direccion", "Dirección", { max: 200, placeholder: "Av. Colón 1200, Córdoba", ancho: true })}
        </div>

        {errorServidor && <div className="alerta error" role="alert">{errorServidor}</div>}

        <div className="acciones-modal">
          <button type="button" className="btn" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn primario" disabled={guardando}>
            {guardando ? "Guardando…" : editando ? "Guardar cambios" : "Crear empresa"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
