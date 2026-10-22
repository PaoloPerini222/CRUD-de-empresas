import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { iniciales } from "../utils/formato.js";
import Logo from "./Logo.jsx";

export const SECCIONES = [
  { to: "/eventos", label: "Eventos" },
  { to: "/clientes", label: "Clientes" },
  { to: "/empresas", label: "Empresas" },
  { to: "/propuestas", label: "Propuestas" },
  { to: "/tareas", label: "Tareas" },
];

export const rolDe = (usuario) => usuario?.roles?.[0] ?? "Sin rol";

export default function Layout() {
  const { usuario, salir } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    salir();
    navigate("/login");
  };

  const clase = ({ isActive }) => (isActive ? "on" : "");

  return (
    <div className="shell">
      <aside className="side">
        <Logo to="/eventos" />
        <nav className="nav">
          {SECCIONES.map((s) => (
            <NavLink key={s.to} to={s.to} className={clase}>
              <i />
              {s.label}
            </NavLink>
          ))}
        </nav>
        <div className="me">
          <div className="avatar">{iniciales(usuario?.nombre)}</div>
          <div className="who">
            <b>{usuario?.nombre ?? usuario?.email}</b>
            <span>{rolDe(usuario)}</span>
          </div>
          <button onClick={cerrarSesion} title="Cerrar sesión">Salir</button>
        </div>
      </aside>

      <div className="mobile-top">
        <Logo to="/eventos" />
        <button className="avatar" onClick={cerrarSesion} title="Cerrar sesión">
          {iniciales(usuario?.nombre)}
        </button>
      </div>

      <Outlet />

      <nav className="mobile-nav">
        {SECCIONES.map((s) => (
          <NavLink key={s.to} to={s.to} className={clase}>
            <i />
            {s.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
