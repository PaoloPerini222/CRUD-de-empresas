import pool from "../data/db.js";
import {parseId, textoOpcional} from "../utils/validaciones.js";
import {RESPONSABLE} from "../middleware/permisos.js";

const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;

// Estados que el organizador puede pedir. La aprobacion (pendiente_aprobacion -> aprobada) es de la responsable.
const TRANSICIONES = {
    borrador: ["pendiente_aprobacion"],
    pendiente_aprobacion: ["borrador"],
    aprobada: ["enviada"],
    enviada: ["en_negociacion", "aceptada", "rechazada"],
    en_negociacion: ["pendiente_aprobacion", "aceptada", "rechazada"],
    aceptada: [],
    rechazada: [],
};

// Como avanza el estado del evento segun lo que pasa con su propuesta (solo mientras es una solicitud).
const ESTADO_EVENTO = {
    pendiente_aprobacion: "en_evaluacion",
    enviada: "propuesta_enviada",
    aceptada: "aceptada",
    rechazada: "rechazada",
};
const ESTADOS_SOLICITUD = ["recibida", "en_evaluacion", "propuesta_enviada"];

const esFechaValida = (valor) => {
    if(typeof valor !== "string" || !REGEX_FECHA.test(valor)){
        return false;
    }

    const fecha = new Date(`${valor.slice(0, 10)}T00:00:00Z`);
    return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(valor.slice(0, 10));
};

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
    if (error.code === "P0001") {
        return res.status(400).json({ mensaje: error.message });
    }
    res.status(500).json({ mensaje });
};

// Datos de texto/fecha que el organizador puede completar; el total, la aprobacion y el estado
// los maneja el sistema.
const validarCampos = (body) => {
    const {fecha_emision, fecha_respuesta} = body;
    for(const [campo, valor] of [["la fecha de emision", fecha_emision], ["la fecha de respuesta", fecha_respuesta]]){
        if(valor !== undefined && valor !== null && !esFechaValida(valor)){
            return {error: `${campo} no es valida (AAAA-MM-DD)`};
        }
    }

    const condiciones = textoOpcional(body.condiciones_acordadas, "las condiciones acordadas", 500);
    const motivo = textoOpcional(body.motivo_rechazo, "el motivo de rechazo", 500);
    const error = condiciones.error ?? motivo.error;
    if(error){
        return {error};
    }

    return {datos: {
        fecha_emision: fecha_emision?.slice(0, 10) ?? null,
        fecha_respuesta: fecha_respuesta?.slice(0, 10) ?? null,
        condiciones_acordadas: condiciones.valor,
        motivo_rechazo: motivo.valor,
    }};
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
        const id = parseId(req.params.id);
        if (id === null) {
            return res.status(400).json({ mensaje: "El id de la propuesta no es válido" });
        }

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

// Toda propuesta nace en borrador, sin aprobacion y con total 0: los servicios (detalle) arman el total.
export const crearPropuesta = async (req, res) => {
    try {
        const idEvento = parseId(req.body?.id_evento);
        if (idEvento === null) {
            return res.status(400).json({ mensaje: "El evento es obligatorio" });
        };

        const { error, datos } = validarCampos(req.body);
        if (error) {
            return res.status(400).json({ mensaje: error });
        }

        const resultado = await pool.query(`
            INSERT INTO propuesta(id_evento, fecha_emision, total, estado, condiciones_acordadas)
            VALUES($1, $2, 0, 'borrador', $3)
            RETURNING *`,
            [idEvento, datos.fecha_emision, datos.condiciones_acordadas]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        manejarErrorDb(error, res, "Error al crear la propuesta");
    }
};

export const editarPropuesta = async (req, res) => {
    const cliente = await pool.connect();
    try {
        const id = parseId(req.params.id);
        if (id === null) {
            return res.status(400).json({ mensaje: "El id de la propuesta no es válido" });
        }

        await cliente.query("BEGIN");

        const actualRes = await cliente.query(
            `SELECT *, fecha_emision::text AS fecha_emision, fecha_respuesta::text AS fecha_respuesta
             FROM propuesta WHERE id_propuesta = $1 FOR UPDATE`, [id]);
        if (actualRes.rows.length === 0) {
            await cliente.query("ROLLBACK");
            return res.status(404).json({ mensaje: "Propuesta no encontrada" });
        }
        const actual = actualRes.rows[0];

        if (req.body?.id_evento !== undefined && parseId(req.body.id_evento) !== actual.id_evento) {
            await cliente.query("ROLLBACK");
            return res.status(400).json({ mensaje: "No se puede cambiar el evento de una propuesta" });
        }

        const { error, datos } = validarCampos({ ...actual, ...req.body });
        if (error) {
            await cliente.query("ROLLBACK");
            return res.status(400).json({ mensaje: error });
        }

        let estado = actual.estado;
        const pedido = req.body?.estado;
        if (pedido !== undefined && pedido !== actual.estado) {
            if (!TRANSICIONES[actual.estado]?.includes(pedido)) {
                await cliente.query("ROLLBACK");
                const permitidos = TRANSICIONES[actual.estado] ?? [];
                const detalle = actual.estado === "pendiente_aprobacion" && pedido === "aprobada"
                    ? "la aprobación la hace la responsable"
                    : `desde ${actual.estado} solo se puede pasar a: ${permitidos.join(", ") || "ningún estado"}`;
                return res.status(409).json({ mensaje: `No se puede pasar la propuesta a ${pedido}: ${detalle}` });
            }
            estado = pedido;
        }

        if (estado === "rechazada" && !datos.motivo_rechazo) {
            await cliente.query("ROLLBACK");
            return res.status(400).json({ mensaje: "Para rechazar la propuesta hay que registrar el motivo" });
        }
        if (estado === "pendiente_aprobacion" && estado !== actual.estado) {
            const servicios = await cliente.query(
                `SELECT 1 FROM detalle_propuesta WHERE id_propuesta = $1 AND NOT descartado LIMIT 1`, [id]);
            if (servicios.rows.length === 0) {
                await cliente.query("ROLLBACK");
                return res.status(400).json({ mensaje: "Para pedir la aprobación la propuesta debe tener al menos un servicio" });
            }
        }

        const respuesta = estado !== actual.estado && (estado === "aceptada" || estado === "rechazada");
        const resultado = await cliente.query(`
            UPDATE propuesta
            SET fecha_emision = $1, condiciones_acordadas = $2, motivo_rechazo = $3, estado = $4::text,
                fecha_respuesta = CASE WHEN $5 THEN COALESCE($6::date, CURRENT_DATE) ELSE $6::date END,
                aprobado_por = CASE WHEN $4::text IN ('borrador', 'pendiente_aprobacion') THEN NULL ELSE aprobado_por END,
                fecha_aprobacion = CASE WHEN $4::text IN ('borrador', 'pendiente_aprobacion') THEN NULL ELSE fecha_aprobacion END
            WHERE id_propuesta = $7
            RETURNING *`,
            [datos.fecha_emision, datos.condiciones_acordadas, datos.motivo_rechazo, estado, respuesta, datos.fecha_respuesta, id]
        );

        // Mientras el evento es una solicitud, su estado acompaña a la propuesta.
        const nuevoEstadoEvento = ESTADO_EVENTO[estado];
        if (estado !== actual.estado && nuevoEstadoEvento) {
            await cliente.query(
                `UPDATE evento SET estado = $1 WHERE id_evento = $2 AND estado = ANY($3)`,
                [nuevoEstadoEvento, actual.id_evento, ESTADOS_SOLICITUD]
            );
        }

        await cliente.query("COMMIT");
        res.json(resultado.rows[0]);
    } catch (error) {
        await cliente.query("ROLLBACK");
        console.error(error);
        manejarErrorDb(error, res, "Error al editar la propuesta");
    } finally {
        cliente.release();
    }
};

// La responsable revisa los importes: aprueba la propuesta pendiente o la devuelve a borrador para corregirla.
export const aprobarPropuesta = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (id === null) {
            return res.status(400).json({ mensaje: "El id de la propuesta no es válido" });
        }
        if (typeof req.body?.aprobar !== "boolean") {
            return res.status(400).json({ mensaje: "Indicá si aprobás o devolvés la propuesta (aprobar: true o false)" });
        }
        if (!req.usuario.roles.includes(RESPONSABLE)) {
            return res.status(403).json({ mensaje: "Solo la responsable aprueba las propuestas" });
        }

        const actual = await pool.query(`
            SELECT estado, total,
                   (SELECT count(*) FROM detalle_propuesta d WHERE d.id_propuesta = $1 AND NOT d.descartado)::int AS servicios
            FROM propuesta WHERE id_propuesta = $1`, [id]);
        if (actual.rows.length === 0) {
            return res.status(404).json({ mensaje: "Propuesta no encontrada" });
        }
        if (actual.rows[0].estado !== "pendiente_aprobacion") {
            return res.status(409).json({ mensaje: "Solo se revisa una propuesta que está pendiente de aprobación" });
        }

        if (req.body.aprobar && actual.rows[0].servicios === 0) {
            return res.status(400).json({ mensaje: "No se puede aprobar una propuesta sin servicios" });
        }

        const resultado = req.body.aprobar
            ? await pool.query(`
                UPDATE propuesta SET estado = 'aprobada', aprobado_por = $1, fecha_aprobacion = now()
                WHERE id_propuesta = $2 RETURNING *`, [req.usuario.id_personal, id])
            : await pool.query(`
                UPDATE propuesta SET estado = 'borrador', aprobado_por = NULL, fecha_aprobacion = NULL
                WHERE id_propuesta = $1 RETURNING *`, [id]);

        res.json(resultado.rows[0]);
    } catch (error) {
        console.error(error);
        manejarErrorDb(error, res, "Error al revisar la propuesta");
    }
};

// Solo se borra una propuesta que todavia es borrador: lo enviado, aceptado o rechazado se conserva.
export const eliminarPropuesta = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (id === null) {
            return res.status(400).json({ mensaje: "El id de la propuesta no es válido" });
        }

        const actual = await pool.query(`SELECT estado FROM propuesta WHERE id_propuesta = $1`, [id]);
        if (actual.rows.length === 0) {
            return res.status(404).json({ mensaje: "Propuesta no encontrada" });
        };
        if (actual.rows[0].estado !== "borrador") {
            return res.status(409).json({ mensaje: "Solo se puede eliminar una propuesta en borrador" });
        }

        const resultado = await pool.query(`DELETE FROM propuesta WHERE id_propuesta = $1 RETURNING *`, [id]);
        res.json({ mensaje: "Propuesta eliminada", propuesta: resultado.rows[0] });
    } catch (error) {
        if (error.code === "23503") {
            return res.status(409).json({ mensaje: "La propuesta tiene detalles asociados y no se puede eliminar" });
        }
        res.status(500).json({ mensaje: "Error al eliminar la propuesta" });
    }
};
