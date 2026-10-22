import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { etiqueta, fechaCorta, moneda } from "../utils/formato.js";

// Página del enlace único de un evento: la abre el cliente, sin cuenta ni login.
// Usa fetch (y no el cliente axios del panel) para no mandar el token de sesión ni cerrar sesión ante un error.
const URL_API = `${import.meta.env.VITE_API_URL ?? "/api"}/publico/evento`;

const COLOR_ESTADO = {
  enviada: "var(--cyan)",
  en_negociacion: "var(--amber)",
  aceptada: "var(--lime)",
  rechazada: "var(--red)",
};

async function pedir(token, ruta = "", opciones) {
  const respuesta = await fetch(`${URL_API}/${token}${ruta}`, opciones);
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.mensaje ?? "No se pudo completar la acción");
  return datos;
}

export default function EventoPublico() {
  const { token } = useParams();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorRespuesta, setErrorRespuesta] = useState("");

  const cargar = () =>
    pedir(token)
      .then((d) => { setDatos(d); setError(""); })
      .catch((e) => setError(e.message));

  useEffect(() => { cargar(); }, [token]);

  const responder = async (decision) => {
    setEnviando(true);
    setErrorRespuesta("");
    try {
      await pedir(token, "/respuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, motivo: decision === "rechazar" ? motivo : undefined }),
      });
      setRechazando(false);
      await cargar();
    } catch (e) {
      setErrorRespuesta(e.message);
    } finally {
      setEnviando(false);
    }
  };

  const { evento, propuesta } = datos ?? {};

  return (
    <div className="pub">
      <Logo />

      {error && (
        <div className="pub-cuerpo">
          <span className="eyebrow">ENLACE NO DISPONIBLE</span>
          <h1>No encontramos<br /><span>este evento.</span></h1>
          <p className="muted">{error}. Pedile a la organizadora que te vuelva a enviar el enlace.</p>
        </div>
      )}

      {!error && !datos && <p className="muted">Cargando…</p>}

      {evento && (
        <div className="pub-cuerpo">
          <span className="eyebrow">TU EVENTO{evento.cliente_nombre ? ` · ${evento.cliente_nombre.toUpperCase()}` : ""}</span>
          <h1>{evento.tipo_evento}</h1>

          <div className="card pub-datos">
            <div><em>Fecha</em>{evento.fecha ? fechaCorta(evento.fecha) : "A definir"}</div>
            <div><em>Sede</em>{evento.sede_prevista ?? "A definir"}</div>
            <div>
              <em>Asistentes</em>
              {evento.cant_asistentes_estimada ? Number(evento.cant_asistentes_estimada).toLocaleString("es-AR") : "A definir"}
            </div>
            {evento.organizador_nombre && <div><em>Organiza</em>{evento.organizador_nombre}</div>}
          </div>

          {evento.necesidades_preferencias && <p className="muted">{evento.necesidades_preferencias}</p>}

          {!propuesta && (
            <div className="card pub-espera">
              <b>Todavía no hay una propuesta para vos.</b>
              <p className="muted">Cuando la organizadora te la envíe, vas a poder verla y responderla desde esta misma página.</p>
            </div>
          )}

          {propuesta && (
            <div className="card pub-propuesta">
              <div className="pub-propuesta-cab">
                <b>Propuesta</b>
                <span className="chip" style={{ "--c": COLOR_ESTADO[propuesta.estado] ?? "var(--muted)" }}>
                  {etiqueta(propuesta.estado)}
                </span>
              </div>

              <table>
                <thead>
                  <tr>{["SERVICIO", "CANT.", "UNITARIO", "SUBTOTAL"].map((t) => <th key={t}>{t}</th>)}</tr>
                </thead>
                <tbody>
                  {propuesta.servicios.map((s, i) => (
                    <tr key={i}>
                      <td data-label="Servicio" className="first">{s.nombre}</td>
                      <td data-label="Cant.">{s.cantidad}</td>
                      <td data-label="Unitario">{moneda(s.importe_unitario)}</td>
                      <td data-label="Subtotal">{moneda(s.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pub-total"><em>Total</em><b>{moneda(propuesta.total)}</b></div>

              {propuesta.condiciones_acordadas && <p className="muted">{propuesta.condiciones_acordadas}</p>}
              {propuesta.estado === "rechazada" && propuesta.motivo_rechazo && (
                <p className="muted">Motivo del rechazo: {propuesta.motivo_rechazo}</p>
              )}

              {propuesta.estado === "aceptada" && (
                <div className="form-ok">Aceptaste esta propuesta{propuesta.fecha_respuesta ? ` el ${fechaCorta(propuesta.fecha_respuesta)}` : ""}. La organizadora se pone en contacto con vos.</div>
              )}
              {propuesta.estado === "rechazada" && (
                <div className="form-error">Rechazaste esta propuesta{propuesta.fecha_respuesta ? ` el ${fechaCorta(propuesta.fecha_respuesta)}` : ""}.</div>
              )}

              {propuesta.puede_responder && (
                <div className="pub-acciones">
                  {errorRespuesta && <div className="form-error">{errorRespuesta}</div>}

                  {!rechazando && (
                    <>
                      <button className="btn" disabled={enviando} onClick={() => responder("aceptar")}>
                        {enviando ? "Enviando…" : "Aceptar propuesta"}
                      </button>
                      <button className="btn btn--ghost" disabled={enviando} onClick={() => setRechazando(true)}>
                        Rechazar
                      </button>
                    </>
                  )}

                  {rechazando && (
                    <>
                      <div className="field">
                        <label htmlFor="motivo">¿Qué no te convenció? (opcional)</label>
                        <textarea
                          id="motivo"
                          value={motivo}
                          maxLength={500}
                          onChange={(e) => setMotivo(e.target.value)}
                        />
                      </div>
                      <button className="btn btn--danger" disabled={enviando} onClick={() => responder("rechazar")}>
                        {enviando ? "Enviando…" : "Confirmar rechazo"}
                      </button>
                      <button className="btn btn--ghost" disabled={enviando} onClick={() => setRechazando(false)}>
                        Volver
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
