import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import RutaProtegida from "./components/RutaProtegida.jsx";
import Acceso from "./pages/Acceso.jsx";
import Clientes from "./pages/Clientes.jsx";
import Empresas from "./pages/Empresas.jsx";
import EventoPublico from "./pages/EventoPublico.jsx";
import Eventos from "./pages/Eventos.jsx";
import Landing from "./pages/Landing.jsx";
import Propuestas from "./pages/Propuestas.jsx";
import Tareas from "./pages/Tareas.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Acceso modo="login" />} />
      <Route path="/registro" element={<Acceso modo="registro" />} />
      <Route path="/evento/:token" element={<EventoPublico />} />

      <Route
        element={
          <RutaProtegida>
            <Layout />
          </RutaProtegida>
        }
      >
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/propuestas" element={<Propuestas />} />
        <Route path="/tareas" element={<Tareas />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
