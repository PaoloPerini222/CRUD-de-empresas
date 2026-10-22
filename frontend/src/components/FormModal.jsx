import { useState } from "react";
import { soloFecha } from "../utils/formato.js";

// Campo: { name, label, type: text|number|date|email|textarea|select, required, options, full, step }
function valorInicial(campo, item) {
  const v = item?.[campo.name] ?? campo.defecto ?? "";
  return campo.type === "date" ? soloFecha(v) : v;
}

// Convierte lo escrito en el formulario a lo que espera el back ("" -> null, números reales).
function limpiar(campos, valores) {
  const salida = {};
  for (const c of campos) {
    const v = valores[c.name];
    if (v === "" || v === undefined) salida[c.name] = null;
    else salida[c.name] = c.type === "number" ? Number(v) : v;
  }
  return salida;
}

export default function FormModal({ titulo, campos, item, onGuardar, onCerrar }) {
  const [valores, setValores] = useState(() =>
    Object.fromEntries(campos.map((c) => [c.name, valorInicial(c, item)]))
  );
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setValores({ ...valores, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError("");
    try {
      await onGuardar(limpiar(campos, valores));
      onCerrar();
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <form className="modal" onSubmit={enviar}>
        <h2>{titulo}</h2>
        <div className="modal-grid">
          {campos.map((c) => (
            <div key={c.name} className={`field ${c.full || c.type === "textarea" ? "full" : ""}`}>
              <label htmlFor={`f-${c.name}`}>{c.label}</label>
              {c.type === "textarea" ? (
                <textarea id={`f-${c.name}`} name={c.name} value={valores[c.name]} onChange={cambiar} required={c.required} />
              ) : c.type === "select" ? (
                <select id={`f-${c.name}`} name={c.name} value={valores[c.name]} onChange={cambiar} required={c.required}>
                  {!c.required && <option value="">—</option>}
                  {c.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={`f-${c.name}`}
                  name={c.name}
                  type={c.type ?? "text"}
                  step={c.type === "number" ? c.step ?? "any" : undefined}
                  min={c.type === "number" ? 0 : undefined}
                  value={valores[c.name]}
                  onChange={cambiar}
                  required={c.required}
                />
              )}
            </div>
          ))}
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn--ghost" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn" disabled={enviando}>{enviando ? "Guardando…" : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}
