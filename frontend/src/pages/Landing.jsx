import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const FUNCIONES = [
  { titulo: "Eventos", texto: "Fecha, sede, asistentes y estado de cada fiesta.", color: "var(--pink)" },
  { titulo: "Roles", texto: "Cada persona del equipo con sus permisos.", color: "var(--amber)" },
  { titulo: "Calendario", texto: "Toda la temporada, semana por semana.", color: "var(--lime)" },
  { titulo: "En vivo", texto: "Qué está listo, qué falta y quién está a cargo.", color: "var(--cyan)" },
];

const PASOS = [
  { n: 1, titulo: "Registrá tu equipo", texto: "Empresas, clientes y personal.", color: "var(--pink)" },
  { n: 2, titulo: "Sumá a tu equipo", texto: "Un rol para cada persona.", color: "var(--amber)" },
  { n: 3, titulo: "Publicá la fiesta", texto: "Creá, aprobá, salí a la pista.", color: "var(--cyan)" },
];

const FAQ = [
  {
    pregunta: "¿Qué diferencia hay entre los roles?",
    respuesta: "El responsable administra, el coordinador aprueba y el organizador crea sus eventos.",
  },
  { pregunta: "¿Puedo manejar varias salas?" },
  { pregunta: "¿Funciona desde el celular?" },
  { pregunta: "¿Cuánto cuesta?" },
];

// Marca con la clase "in" los elementos .reveal cuando entran en pantalla.
function useReveal(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const els = ref.current.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ref]);
}

export default function Landing() {
  const { usuario } = useAuth();
  const [abierta, setAbierta] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const raiz = useRef(null);

  useEffect(() => {
    const alScroll = () => setScrolled(window.scrollY > 24);
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  useReveal(raiz);

  if (usuario) return <Navigate to="/eventos" replace />;

  return (
    <div className="landing" ref={raiz}>
        <header className={`land-nav ${scrolled ? "scrolled" : ""}`}>
          <span>NOCTIS / GESTOR DE FIESTAS</span>
          <nav>
            <a href="#funcionalidades">FUNCIONALIDADES</a>
            <a href="#como-funciona">CÓMO FUNCIONA</a>
            <a href="#faq">FAQ</a>
            <Link to="/login" className="cta">INGRESAR →</Link>
          </nav>
        </header>
      <section className="land-hero">
        <h1 className="land-title">NOC<br /><span>TIS</span></h1>
        <div className="land-sub">
          <p className="reveal d1">El gestor de fiestas para boliches.</p>
          <ul className="reveal d2">
            <li>RESPONSABLES</li>
            <li>COORDINADORES</li>
            <li>ORGANIZADORES</li>
          </ul>
          <div className="end reveal d3">
            <Link to="/registro" className="pill-btn">Crear cuenta gratis</Link>
          </div>
        </div>
      </section>

      <section className="lineup" id="funcionalidades">
        <div className="lineup-head reveal">
          <span>LINE-UP DE FUNCIONALIDADES</span>
          <span>{String(FUNCIONES.length).padStart(2, "0")} ACTOS</span>
        </div>
        {FUNCIONES.map((f) => (
          <div key={f.titulo} className="lineup-row reveal">
            <b style={{ color: f.color }}>{f.titulo}</b>
            <span>{f.texto}</span>
          </div>
        ))}
      </section>

      <section className="steps" id="como-funciona">
        {PASOS.map((p) => (
          <div key={p.n} className="step reveal" style={{ "--c": p.color }}>
            <span className="n">{p.n}</span>
            <h3>{p.titulo}</h3>
            <p>{p.texto}</p>
          </div>
        ))}
      </section>

      <section className="faq" id="faq">
        <h2 className="reveal">FAQ</h2>
        <div>
          {FAQ.map((f, i) => (
            <div key={f.pregunta} className="faq-item reveal">
              <button onClick={() => setAbierta(abierta === i ? -1 : i)}>
                {f.pregunta}
              </button>
              {abierta === i && f.respuesta && <p>{f.respuesta}</p>}
            </div>
          ))}
        </div>
      </section>

      <footer className="land-foot">
        <span>NOCTIS</span>
        <Link to="/login">INGRESAR →</Link>
      </footer>
    </div>
  );
}
