import { useState } from "react";
import Modal from "./Modal.jsx";

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
    <Modal titulo="Eliminar empresa" onCerrar={onCerrar}>
      <p className="texto-confirmar">
        ¿Seguro que querés eliminar <b>{empresa.nombre}</b> (CUIT {empresa.cuit})? Esta acción no se puede deshacer.
      </p>
      {error && <div className="alerta error" role="alert">{error}</div>}
      <div className="acciones-modal">
        <button className="btn" onClick={onCerrar}>Cancelar</button>
        <button className="btn peligro" onClick={confirmar} disabled={eliminando}>
          {eliminando ? "Eliminando…" : "Eliminar"}
        </button>
      </div>
    </Modal>
  );
}
