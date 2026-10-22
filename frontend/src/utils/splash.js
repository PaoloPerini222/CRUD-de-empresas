// Splash (pantalla de entrada). Hay dos versiones con el mismo aspecto:
//   1) Al abrir la página: el HTML está en index.html (así se ve antes de que cargue React).
//      iniciarSplash() lo deja unos segundos, espera a las fuentes y lo desvanece.
//   2) Al cambiar de modo claro/oscuro: lo dibuja el componente <Splash /> (components/Splash.jsx, con Ant Design).
//      mostrarSplash() le avisa que tiene que aparecer.

export const DURACION = 2900; // ms al abrir la página
export const DURACION_RAPIDA = 1900; // ms al cambiar de modo (la animación va más rápida)
export const DURACION_REDUCIDA = 400; // ms si el usuario pidió menos animaciones

const oyentes = new Set();

export const menosMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Se llama una vez al arrancar la app (main.jsx): oculta el splash de index.html cuando corresponde.
export function iniciarSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;
  const minimo = new Promise((resolver) => setTimeout(resolver, menosMovimiento() ? DURACION_REDUCIDA : DURACION));
  const fuentes = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.all([minimo, fuentes]).then(() => {
    splash.classList.add("fuera");
    setTimeout(() => splash.remove(), 900);
  });
}

// El componente <Splash /> se suscribe acá para enterarse de cuándo mostrarse.
export function suscribirSplash(oyente) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

// Pide mostrar el splash otra vez (se usa al cambiar de modo, ver utils/tema.js).
export function mostrarSplash() {
  oyentes.forEach((oyente) => oyente());
}
