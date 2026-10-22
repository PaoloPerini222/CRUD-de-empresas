import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import empresasRoutes from "./routes/empresas.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";
import eventoRoutes from "./routes/evento.routes.js";
import tareaRoutes from "./routes/tarea.routes.js";
import propuestaRoutes from "./routes/propuesta.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/empresas", empresasRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/evento", eventoRoutes);
app.use("/api/propuesta", propuestaRoutes);
app.use("/api/tarea", tareaRoutes);

app.use((req, res) => {
    res.status(404).json({ mensaje: "Ruta no encontrada" });
});

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`)
})