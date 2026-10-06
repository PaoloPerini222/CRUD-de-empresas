import { useEffect } from "react";
import Icon from "./Icon.jsx";

export default function Modal({ titulo, subtitulo, icono, tono = "violeta", onCerrar, children }) {
  useEffect(() => {
    const alTeclear = (e) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", alTeclear);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = "";
    };
  }, [onCerrar]);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <div className="modal-head">
          {icono && (
            <span className={`modal-icono ${tono}`}>
              <Icon name={icono} size={20} />
            </span>
          )}
          <div className="modal-titulos">
            <h2 id="modal-titulo">{titulo}</h2>
            {subtitulo && <p>{subtitulo}</p>}
          </div>
          <button className="btn-icono" onClick={onCerrar} aria-label="Cerrar">
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
