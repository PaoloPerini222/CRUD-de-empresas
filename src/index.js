import "dotenv/config";
import express from "express";
import cors from "cors";
import empresasRoutes from "./routes/empresas.routes.js"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use("/api/empresas", empresasRoutes);

app.use((req, res) => {
    res.status(404).json({ mensaje: "Ruta no encontrada" })
});

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`)
})