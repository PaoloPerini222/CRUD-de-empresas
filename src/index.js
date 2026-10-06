import "dotenv/config";
import express from "express";
import cors from "cors";
import empresasRoutes from "./routes/empresas.routes.js"

const app = express();
const PORT = process.env.PORT || 3000;

// FRONTEND_URL acepta varios orígenes separados por coma; si no está definida, CORS queda abierto
const origenes = process.env.FRONTEND_URL?.split(",").map((o) => o.trim().replace(/\/$/, "")).filter(Boolean);
app.use(cors(origenes?.length ? { origin: origenes } : undefined));
app.use(express.json());

app.use("/api/empresas", empresasRoutes);

app.use((req, res) => {
    res.status(404).json({ mensaje: "Ruta no encontrada" })
});

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`)
})