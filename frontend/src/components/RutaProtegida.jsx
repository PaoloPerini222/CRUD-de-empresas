import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function RutaProtegida({ children }) {
  const { usuario } = useAuth();

  if (!usuario || !localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RutaProtegida;
