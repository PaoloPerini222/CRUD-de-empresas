import { createContext, useContext, useState } from "react";
import * as authService from "../services/authService";

// Sesión global. Guarda el token y el usuario en localStorage para sobrevivir a recargas.
//   usuario  -> datos del usuario logueado (o null)
//   ingresar -> hace login y guarda la sesión
//   salir    -> borra la sesión
// Uso en cualquier componente: const { usuario, ingresar, salir } = useAuth();
const AuthContext = createContext(null);

// Lee el usuario guardado; si el JSON está roto devuelve null en vez de romper la app.
function leerUsuario() {
  try {
    return JSON.parse(localStorage.getItem("usuario"));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerUsuario);

  const ingresar = async (email, password) => {
    const datos = await authService.login(email, password);
    localStorage.setItem("token", datos.token);
    localStorage.setItem("usuario", JSON.stringify(datos.usuario));
    setUsuario(datos.usuario);
  };

  const salir = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, ingresar, salir }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
