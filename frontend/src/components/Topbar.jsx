import { useAuth } from "../context/AuthContext.jsx";
import { rolDe } from "./Layout.jsx";

export default function Topbar({ busqueda, onBusqueda, placeholder }) {
  const { usuario } = useAuth();
  return (
    <div className="topbar">
      <input
        className="search"
        type="search"
        value={busqueda}
        onChange={(e) => onBusqueda(e.target.value)}
        placeholder={placeholder}
      />
      <span className="role-pill">ROL · {rolDe(usuario).toUpperCase()}</span>
    </div>
  );
}
