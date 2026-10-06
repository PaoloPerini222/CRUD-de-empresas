import Icon from "./Icon.jsx";
import { formatearMes, iniciales, mapsUrl, paletaDe, telUrl } from "../utils.js";

function Dato({ icono, href, externo, children, vacio }) {
  return (
    <li>
      <Icon name={icono} size={16} />
      {children ? (
        <a href={href} {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>
      ) : (
        <span className="dato-vacio">{vacio}</span>
      )}
    </li>
  );
}

export default function LugarCard({ lugar, indice, onEditar, onEliminar }) {
  const [c1, c2] = paletaDe(lugar.nombre);

  return (
    <article
      className="lugar glass"
      style={{ "--c1": c1, "--c2": c2, animationDelay: `${Math.min(indice, 9) * 45}ms` }}
    >
      <div className="lugar-poster">
        <span className="lugar-iniciales">{iniciales(lugar.nombre)}</span>
        <span className={`chip-estado ${lugar.activo ? "on" : "off"}`}>
          <span className="punto" />
          {lugar.activo ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="lugar-cuerpo">
        <h3 className="lugar-nombre">{lugar.nombre}</h3>
        <p className="lugar-cuit">CUIT {lugar.cuit}</p>

        <ul className="lugar-datos">
          <Dato icono="pin" href={lugar.direccion && mapsUrl(lugar.direccion)} externo vacio="Sin dirección">
            {lugar.direccion}
          </Dato>
          <Dato icono="phone" href={lugar.telefono && telUrl(lugar.telefono)} vacio="Sin teléfono">
            {lugar.telefono}
          </Dato>
          <Dato icono="mail" href={lugar.email && `mailto:${lugar.email}`} vacio="Sin email">
            {lugar.email}
          </Dato>
        </ul>

        <div className="lugar-pie">
          <span className="lugar-alta">
            <Icon name="calendar" size={15} /> Desde {formatearMes(lugar.fecha_creacion)}
          </span>
          <div className="lugar-acciones">
            <button className="btn-icono" onClick={onEditar} aria-label={`Editar ${lugar.nombre}`} title="Editar">
              <Icon name="edit" />
            </button>
            <button className="btn-icono peligro" onClick={onEliminar} aria-label={`Eliminar ${lugar.nombre}`} title="Eliminar">
              <Icon name="trash" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
