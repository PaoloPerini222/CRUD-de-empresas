import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { mensajeError } from "../services/api.js";
import { registrar } from "../services/authService.js";

// Login y registro comparten pantalla: modo "login" o "registro" según la ruta.
export default function Acceso({ modo }) {
  const esLogin = modo === "login";
  const { usuario, ingresar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => setError(""), [modo]);

  if (usuario) return <Navigate to="/eventos" replace />;

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      if (esLogin) {
        await ingresar(form.email, form.password);
      } else {
        await registrar(form);
        await ingresar(form.email, form.password);
      }
      navigate("/eventos");
    } catch (err) {
      setError(mensajeError(err, esLogin ? "Error al iniciar sesión" : "Error al crear la cuenta"));
      setEnviando(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-art">
        <div className="art-top">
          <Logo />
          <Link to="/" className="back">← Volver al inicio</Link>
        </div>
        {esLogin ? (
          <h2 key="l">Volvé<br /><span style={{ color: "var(--pink)" }}>a la pista.</span></h2>
        ) : (
          <h2 key="r">Sumate<br /><span style={{ color: "var(--lime)" }}>al equipo.</span></h2>
        )}
      </div>

      <form className="auth-form" onSubmit={enviar}>
        <div className="tabs-seg">
          <Link to="/login" className={esLogin ? "on" : ""}>Ingresar</Link>
          <Link to="/registro" className={esLogin ? "" : "on"}>Crear cuenta</Link>
        </div>

        <div className="swap" key={modo}>
          <div>
            <h1>{esLogin ? "Ingresá a tu cuenta" : "Creá tu cuenta"}</h1>
            {esLogin && <p className="lead">Usá el email con el que te registraste.</p>}
          </div>

          {!esLogin && (
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" name="nombre" value={form.nombre} onChange={cambiar} placeholder="Nombre Apellido" required />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={cambiar} placeholder="Usuario@gmail.com" required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password" name="password" type="password" value={form.password} onChange={cambiar}
              placeholder={esLogin ? "**********" : "Mínimo 8 caracteres"} required minLength={esLogin ? undefined : 8}
              autoComplete={esLogin ? "current-password" : "new-password"}
            />
          </div>

        </div>

        {error && <div className="form-error">{error}</div>}

        <button type="submit" className="btn btn--lg" disabled={enviando}>
          {enviando ? "Un momento…" : esLogin ? "Ingresar" : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
