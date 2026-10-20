import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import Empresas from "./pages/Empresas.jsx";
import Clientes from "./pages/Clientes.jsx";
import Eventos from "./pages/Eventos.jsx";
import Propuestas from "./pages/Propuestas.jsx";
import Tareas from "./pages/Tareas.jsx";

export default function App() {
  return (
    <>
      <nav>
        <NavLink to="/empresas">Empresas</NavLink>{" "}
        <NavLink to="/clientes">Clientes</NavLink>{" "}
        <NavLink to="/eventos">Eventos</NavLink>{" "}
        <NavLink to="/propuestas">Propuestas</NavLink>{" "}
        <NavLink to="/tareas">Tareas</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/eventos" replace />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/propuestas" element={<Propuestas />} />
        <Route path="/tareas" element={<Tareas />} />
      </Routes>
    </>
  );
}
