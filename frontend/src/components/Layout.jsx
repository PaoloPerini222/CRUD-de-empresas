import {
  BankOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  LogoutOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Menu, Tooltip } from "antd";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { iniciales } from "../utils/formato.js";
import BotonTema from "./BotonTema.jsx";
import Logo from "./Logo.jsx";

// Secciones del panel: alimentan el menú lateral (escritorio) y la barra inferior (móvil).
export const SECCIONES = [
  { to: "/eventos", label: "Eventos", icono: <CalendarOutlined /> },
  { to: "/clientes", label: "Clientes", icono: <TeamOutlined /> },
  { to: "/empresas", label: "Empresas", icono: <BankOutlined /> },
  { to: "/propuestas", label: "Propuestas", icono: <FileTextOutlined /> },
  { to: "/tareas", label: "Tareas", icono: <CheckSquareOutlined /> },
];

export const rolDe = (usuario) => usuario?.roles?.[0] ?? "Sin rol";

// Estilo del círculo con las iniciales del usuario.
const ESTILO_AVATAR = { background: "var(--amber)", color: "var(--on-primary)", fontWeight: 700 };

// Estructura de las páginas privadas: menú lateral fijo en escritorio, cabecera + barra inferior en móvil.
// <Outlet /> es donde React Router dibuja la página activa (Eventos, Clientes, etc.).
export default function Layout() {
  const { usuario, salir } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const cerrarSesion = () => {
    salir();
    navigate("/login");
  };

  const nombre = usuario?.nombre ?? usuario?.email;

  return (
    <div className="shell">
      <aside className="side">
        <Logo to="/eventos" />

        {/* Menú de Ant Design: la sección activa sale de la URL actual. */}
        <Menu
          mode="inline"
          className="menu-lateral"
          selectedKeys={[pathname]}
          items={SECCIONES.map((s) => ({ key: s.to, icon: s.icono, label: s.label }))}
          onClick={({ key }) => navigate(key)}
        />

        <BotonTema bloque className="boton-tema--side" />

        <div className="me">
          <Avatar style={ESTILO_AVATAR}>{iniciales(usuario?.nombre)}</Avatar>
          <div className="who">
            <b>{nombre}</b>
            <span>{rolDe(usuario)}</span>
          </div>
          <Tooltip title="Cerrar sesión">
            <Button type="text" shape="circle" icon={<LogoutOutlined />} aria-label="Cerrar sesión" onClick={cerrarSesion} />
          </Tooltip>
        </div>
      </aside>

      {/* Cabecera que solo se ve en teléfono. */}
      <div className="mobile-top">
        <Logo to="/eventos" />
        <BotonTema />
        <Dropdown
          trigger={["click"]}
          menu={{ items: [{ key: "salir", icon: <LogoutOutlined />, label: "Cerrar sesión", onClick: cerrarSesion }] }}
        >
          <Avatar style={{ ...ESTILO_AVATAR, cursor: "pointer" }} size={40}>
            {iniciales(usuario?.nombre)}
          </Avatar>
        </Dropdown>
      </div>

      <Outlet />

      {/* Barra inferior que solo se ve en teléfono. NavLink marca con "on" la sección activa. */}
      <nav className="mobile-nav">
        {SECCIONES.map((s) => (
          <NavLink key={s.to} to={s.to} className={({ isActive }) => (isActive ? "on" : "")}>
            {s.icono}
            {s.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
