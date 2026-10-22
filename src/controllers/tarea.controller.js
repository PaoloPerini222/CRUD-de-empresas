import pool from "../data/db.js";

const manejarErrorDb = (error, res, mensaje) => {
    if (error.code === "23503") {
        return res.status(400).json({ mensaje: "El evento, el personal o el detalle indicado no existe" });
    }
    if (error.code === "23514" && error.constraint === "chk_tarea_estado") {
        return res.status(400).json({ mensaje: "Estado de tarea inválido" });
    }
    if (error.code === "23514" && error.constraint === "chk_tarea_fecha_prevista") {
        return res.status(400).json({ mensaje: "La fecha prevista es obligatoria" });
    }
    res.status(500).json({ mensaje });
};

export const obtenerTareas = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT *,
                (fecha_prevista < CURRENT_DATE AND estado NOT IN ('terminada', 'cancelada')) AS vencida
            FROM tarea
            ORDER BY id_tarea`);
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener las tareas" });
    };
};

export const obtenerTarea = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const resultado = await pool.query(`
            SELECT *,
                (fecha_prevista < CURRENT_DATE AND estado NOT IN ('terminada', 'cancelada')) AS vencida
            FROM tarea
            WHERE id_tarea = $1`, [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Tarea no encontrada" });
        };
        res.json(resultado.rows[0]);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener la tarea" });
    }
};

export const crearTarea = async (req, res) => {
    try {
        const { id_evento, id_personal, descripcion, fecha_prevista, estado, id_detalle } = req.body ?? {};
        if (!id_evento || !id_personal || !descripcion || !fecha_prevista) {
            return res.status(400).json({ mensaje: "Evento, personal, descripción y fecha prevista son obligatorios" });
        };

        const resultado = await pool.query(`
            INSERT INTO tarea(id_evento, id_personal, descripcion, fecha_prevista, estado, id_detalle)
            VALUES($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [id_evento, id_personal, descripcion, fecha_prevista, estado ?? "pendiente", id_detalle ?? null]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        manejarErrorDb(error, res, "Error al crear la tarea");
    }
};

export const editarTarea = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { id_evento, id_personal, descripcion, fecha_prevista, estado, id_detalle } = req.body ?? {};
        if (!id_evento || !id_personal || !descripcion || !fecha_prevista) {
            return res.status(400).json({ mensaje: "Evento, personal, descripción y fecha prevista son obligatorios" });
        };

        const resultado = await pool.query(`
            UPDATE tarea
            SET id_evento = $1, id_personal = $2, descripcion = $3, fecha_prevista = $4,
                estado = COALESCE($5, estado), id_detalle = $6
            WHERE id_tarea = $7
            RETURNING *`,
            [id_evento, id_personal, descripcion, fecha_prevista, estado ?? null, id_detalle ?? null, id]
        );
        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Tarea no encontrada" });
        };
        res.json(resultado.rows[0]);
    } catch (error) {
        manejarErrorDb(error, res, "Error al editar la tarea");
    }
};

export const eliminarTarea = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const resultado = await pool.query(`DELETE FROM tarea WHERE id_tarea = $1 RETURNING *`, [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Tarea no encontrada" });
        };
        res.json({ mensaje: "Tarea eliminada", tarea: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar la tarea" });
    }
};
