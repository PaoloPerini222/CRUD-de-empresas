// Fondo de "pista": luces y haces de reflector hechos con gradientes (sin imágenes
// ni filtros de blur, que son lo más pesado para celulares viejos).
export default function Escena() {
  return (
    <div className="escena" aria-hidden="true">
      <span className="orbe orbe-1" />
      <span className="orbe orbe-2" />
      <span className="orbe orbe-3" />
      <span className="haz haz-1" />
      <span className="haz haz-2" />
      <span className="grano" />
      <span className="vineta" />
    </div>
  );
}
