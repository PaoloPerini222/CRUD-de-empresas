// CUIT con formato XX-XXXXXXXX-X (13 caracteres, como la columna de la base)
export const formatearCuit = (valor) => {
  const d = String(valor).replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 10) return `${d.slice(0, 2)}-${d.slice(2)}`;
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
};

export const cuitValido = (cuit) => /^\d{2}-\d{8}-\d$/.test(cuit);
export const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const formatearFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const formatearMes = (iso) =>
  iso ? new Date(iso).toLocaleDateString("es-AR", { month: "short", year: "numeric" }) : "—";

export const esDelMesActual = (iso) => {
  if (!iso) return false;
  const f = new Date(iso);
  const hoy = new Date();
  return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
};

export const iniciales = (nombre) =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

// Pares oscuros y saturados: el texto blanco encima siempre mantiene buen contraste
const PALETAS = [
  ["#6d28d9", "#db2777"],
  ["#4338ca", "#0891b2"],
  ["#a21caf", "#c2410c"],
  ["#0f766e", "#4338ca"],
  ["#be185d", "#7c2d12"],
  ["#1d4ed8", "#7e22ce"],
  ["#9d174d", "#5b21b6"],
];

export const paletaDe = (texto) => {
  let h = 0;
  for (const ch of texto) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETAS[h % PALETAS.length];
};

export const mapsUrl = (direccion) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;

export const telUrl = (telefono) => `tel:${telefono.replace(/[^\d+]/g, "")}`;
