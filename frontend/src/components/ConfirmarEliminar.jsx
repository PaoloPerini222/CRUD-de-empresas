import { useState } from "react";
import Modal from "./Modal.jsx";
import Icon from "./Icon.jsx";

export default function ConfirmarEliminar({ empresa, onConfirmar, onCerrar }) {
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  const confirmar = async () => {
    setEliminando(true);
    setError("");
    try {
      await onConfirmar();
    } catch (err) {
      setError(err.message);
      setEliminando(false);
    }
  };

  return (
    <Modal titulo="¿Eliminar este lugar?" subtitulo="Esta acción no se puede deshacer." icono="trash" tono="rojo" onCerrar={onCerrar}>
      <div className="resumen-eliminar">
        <b>{empresa.nombre}</b>
        <span>CUIT {empresa.cuit}</span>
      </div>
      {error && (
        <div className="alerta" role="alert">
          <Icon name="alert" size={16} /> {error}
        </div>
      )}
      <div className="acciones-modal">
        <button className="btn" onClick={onCerrar}>Cancelar</button>
        <button className="btn peligro" onClick={confirmar} disabled={eliminando}>
          {eliminando ? "Eliminando…" : "Sí, eliminar"}
        </button>
      </div>
    </Modal>
  );
}
