import pool from "../data/db.js";

const manejarErrorDb = (error, res, mensaje) => {
    if (error.code === "23505") {
        return res.status(409).json({ mensaje: "Ya existe una propuesta para ese evento" });
    }
    if (error.code === "23503") {
        return res.status(400).json({ mensaje: "El evento o el personal indicado no existe" });
    }
    if (error.code === "23514" && error.constraint === "chk_propuesta_estado") {
        return res.status(400).json({ mensaje: "Estado de propuesta inválido" });
    }
    res.status(500).json({ mensaje });
};

export const obtenerPropuestas = async (req, res) => {
    try {
        const resultado = await pool.query(`SELECT * FROM propuesta ORDER BY id_propuesta`)
        res.json(resultado.rows)
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener las propuestas" })
    };
};

export const obtenerPropuesta = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const resultado = await pool.query(`
            SELECT * FROM propuesta
            WHERE id_propuesta = $1`, [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Propuesta no encontrada" });
        };
        res.json(resultado.rows[0]);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener la propuesta" });
    }
};

export const crearPropuesta = async (req, res) => {
    try {
        const {
            id_evento, fecha_emision, total, estado, fecha_respuesta,
            condiciones_acordadas, aprobado_por, fecha_aprobacion, motivo_rechazo,
        } = req.body ?? {};
        if (!id_evento) {
            return res.status(400).json({ mensaje: "El evento es obligatorio" });
        };

        const resultado = await pool.query(`
            INSERT INTO propuesta(id_evento, fecha_emision, total, estado, fecha_respuesta,
                condiciones_acordadas, aprobado_por, fecha_aprobacion, motivo_rechazo)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                id_evento, fecha_emision ?? null, total ?? 0, estado ?? "borrador", fecha_respuesta ?? null,
                condiciones_acordadas ?? null, aprobado_por ?? null, fecha_aprobacion ?? null, motivo_rechazo ?? null,
            ]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        manejarErrorDb(error, res, "Error al crear la propuesta");
    }
};

export const editarPropuesta = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const {
            id_evento, fecha_emision, total, estado, fecha_respuesta,
            condiciones_acordadas, aprobado_por, fecha_aprobacion, motivo_rechazo,
        } = req.body ?? {};
        if (!id_evento) {
            return res.status(400).json({ mensaje: "El evento es obligatorio" });
        };

        const resultado = await pool.query(`
            UPDATE propuesta
            SET id_evento = $1, fecha_emision = $2, total = $3, estado = COALESCE($4, estado),
                fecha_respuesta = $5, condiciones_acordadas = $6, aprobado_por = $7,
                fecha_aprobacion = $8, motivo_rechazo = $9
            WHERE id_propuesta = $10
            RETURNING *`,
            [
                id_evento, fecha_emision ?? null, total ?? 0, estado ?? null, fecha_respuesta ?? null,
                condiciones_acordadas ?? null, aprobado_por ?? null, fecha_aprobacion ?? null, motivo_rechazo ?? null,
                id,
            ]
        );
        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Propuesta no encontrada" });
        };
        res.json(resultado.rows[0]);
    } catch (error) {
        manejarErrorDb(error, res, "Error al editar la propuesta");
    }
};

export const eliminarPropuesta = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const resultado = await pool.query(`DELETE FROM propuesta WHERE id_propuesta = $1 RETURNING *`, [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "Propuesta no encontrada" });
        };
        res.json({ mensaje: "Propuesta eliminada", propuesta: resultado.rows[0] });
    } catch (error) {
        if (error.code === "23503") {
            return res.status(409).json({ mensaje: "La propuesta tiene detalles asociados y no se puede eliminar" });
        }
        res.status(500).json({ mensaje: "Error al eliminar la propuesta" });
    }
};
