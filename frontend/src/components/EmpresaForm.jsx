import { useState } from "react";
import Modal from "./Modal.jsx";
import Icon from "./Icon.jsx";
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
    if (!datos.nombre.trim()) er.nombre = "Poné el nombre del lugar";
    if (!datos.cuit.trim()) er.cuit = "El CUIT es obligatorio";
    else if (!cuitValido(datos.cuit)) er.cuit = "Tiene que tener 11 dígitos: 30-12345678-9";
    else if (empresas.some((e) => e.cuit === datos.cuit && e.id_empresa !== empresa?.id_empresa))
      er.cuit = "Ya hay un lugar cargado con ese CUIT";
    if (datos.email.trim() && !emailValido(datos.email.trim())) er.email = "Revisá el formato del email";
    return er;
  };

  const enviar = async (e) => {
    e.preventDefault();
    const er = validar();
    setErrores(er);
    if (Object.keys(er).length) {
      document.getElementById(Object.keys(er)[0])?.focus();
      return;
    }

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

  const campo = (id, etiqueta, icono, props = {}) => (
    <div className={`campo ${props.ancho ? "ancho" : ""}`}>
      <label htmlFor={id}>
        {etiqueta} {props.obligatorio && <span className="req" aria-hidden="true">*</span>}
      </label>
      <div className={`input-wrap ${errores[id] ? "con-error" : ""}`}>
        <Icon name={icono} size={17} />
        <input
          id={id}
          value={datos[id]}
          onChange={cambiar(id)}
          aria-invalid={Boolean(errores[id])}
          aria-describedby={errores[id] ? `${id}-error` : props.ayuda ? `${id}-ayuda` : undefined}
          aria-required={props.obligatorio || undefined}
          maxLength={props.max}
          placeholder={props.placeholder}
          type={props.type || "text"}
          inputMode={props.inputMode}
          autoComplete={props.autoComplete || "off"}
          autoFocus={props.autoFocus}
        />
      </div>
      {errores[id] ? (
        <p className="error-campo" id={`${id}-error`}><Icon name="alert" size={14} /> {errores[id]}</p>
      ) : (
        props.ayuda && <p className="ayuda" id={`${id}-ayuda`}>{props.ayuda}</p>
      )}
    </div>
  );

  return (
    <Modal
      titulo={editando ? "Editar lugar" : "Nuevo lugar"}
      subtitulo={editando ? empresa.nombre : "Boliche, productora o salón de fiestas"}
      icono={editando ? "edit" : "sparkles"}
      onCerrar={onCerrar}
    >
      <form onSubmit={enviar} noValidate>
        <fieldset>
          <legend>El lugar</legend>
          <div className="grid-form">
            {campo("nombre", "Nombre", "building", { obligatorio: true, max: 150, placeholder: "Ej: Mandarine Club", ancho: true, autoFocus: true })}
            {campo("cuit", "CUIT", "id", { obligatorio: true, max: 13, placeholder: "30-12345678-9", inputMode: "numeric", ancho: true, ayuda: "Se completan los guiones solos." })}
          </div>
        </fieldset>

        <fieldset>
          <legend>Contacto y ubicación</legend>
          <div className="grid-form">
            {campo("telefono", "Teléfono", "phone", { max: 30, placeholder: "351 400-1122", inputMode: "tel", autoComplete: "tel" })}
            {campo("email", "Email", "mail", { max: 150, placeholder: "reservas@club.com", type: "email", autoComplete: "email" })}
            {campo("direccion", "Dirección", "pin", { max: 200, placeholder: "Av. Colón 1200, Nueva Córdoba", ancho: true })}
          </div>
        </fieldset>

        {errorServidor && (
          <div className="alerta" role="alert">
            <Icon name="alert" size={16} /> {errorServidor}
          </div>
        )}

        <div className="acciones-modal">
          <button type="button" className="btn" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn primario" disabled={guardando}>
            {guardando ? "Guardando…" : editando ? "Guardar cambios" : "Agregar lugar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
