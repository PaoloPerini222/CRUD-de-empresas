import pool from "../data/db.js";

const ID_MAXIMO = 2147483647;
const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const ESTADOS = [
    "recibida",
    "en_evaluacion",
    "propuesta_enviada",
    "aceptada",
    "rechazada",
    "confirmado",
    "preparacion",
    "realizado",
    "cancelado",
];
const ESTADOS_SEDE = ["pendiente", "confirmada"];
const ESTADOS_QUE_EXIGEN_DATOS = ["aceptada", "confirmado", "preparacion", "realizado"];

const parseId = (valor) => {
    if(typeof valor !== "string" || !/^\d+$/.test(valor)){
        return null;
    }

    const id = Number(valor);
    if(id < 1 || id > ID_MAXIMO){
        return null;
    }

    return id;
};

const esFechaValida = (valor) => {
    if(typeof valor !== "string" || !REGEX_FECHA.test(valor)){
        return false;
    }

    const fecha = new Date(`${valor}T00:00:00Z`);
    return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(valor);
};

const validarTexto = (valor, campo, maximo) => {
    if(valor === undefined || valor === null){
        return null;
    }
    if(typeof valor !== "string"){
        return `${campo} no es valido`;
    }
    if(valor.trim().length > maximo){
        return `${campo} no puede superar los ${maximo} caracteres`;
    }
    return null;
};

const validarEvento = (body, {requiereCliente}) => {
    const {
        id_cliente, tipo_evento, fecha, sede_prevista, cant_asistentes_estimada,
        necesidades_preferencias, estado, id_organizador, estado_sede,
    } = body ?? {};

    let idCliente = null;
    if(requiereCliente){
        idCliente = parseId(String(id_cliente ?? ""));
        if(idCliente === null){
            return {error: "el id del cliente no es valido"};
        }
    }

    if(typeof tipo_evento !== "string" || !tipo_evento.trim()){
        return {error: "el tipo de evento es obligatorio"};
    }

    if(fecha !== undefined && fecha !== null && !esFechaValida(fecha)){
        return {error: "la fecha no es valida (AAAA-MM-DD)"};
    }

    if(cant_asistentes_estimada !== undefined && cant_asistentes_estimada !== null){
        if(!Number.isInteger(cant_asistentes_estimada) || cant_asistentes_estimada < 1 || cant_asistentes_estimada > ID_MAXIMO){
            return {error: "la cantidad de asistentes estimada no es valida"};
        }
    }

    let idOrganizador = null;
    if(id_organizador !== undefined && id_organizador !== null){
        idOrganizador = parseId(String(id_organizador));
        if(idOrganizador === null){
            return {error: "el id del organizador no es valido"};
        }
    }

    if(estado !== undefined && !ESTADOS.includes(estado)){
        return {error: `el estado debe ser uno de: ${ESTADOS.join(", ")}`};
    }
    if(estado_sede !== undefined && !ESTADOS_SEDE.includes(estado_sede)){
        return {error: `el estado de la sede debe ser uno de: ${ESTADOS_SEDE.join(", ")}`};
    }

    const errorTexto =
        validarTexto(tipo_evento, "el tipo de evento", 50) ??
        validarTexto(sede_prevista, "la sede prevista", 100) ??
        validarTexto(necesidades_preferencias, "las necesidades y preferencias", 500);
    if(errorTexto){
        return {error: errorTexto};
    }

    const datos = {
        id_cliente: idCliente,
        tipo_evento: tipo_evento.trim(),
        fecha: fecha ?? null,
        sede_prevista: sede_prevista?.trim() || null,
        cant_asistentes_estimada: cant_asistentes_estimada ?? null,
        necesidades_preferencias: necesidades_preferencias?.trim() || null,
        estado: estado ?? "recibida",
        id_organizador: idOrganizador,
        estado_sede: estado_sede ?? "pendiente",
    };

    if(ESTADOS_QUE_EXIGEN_DATOS.includes(datos.estado) && (!datos.fecha || !datos.sede_prevista || !datos.cant_asistentes_estimada)){
        return {error: "para aceptar o confirmar el evento se requiere fecha, sede y cantidad estimada de asistentes"};
    }

    return {datos};
};

const responderErrorBD = (error, res, mensajeGenerico) => {
    if(error.code === "23503"){
        return res.status(400).json({mensaje: "el cliente o el organizador indicado no existe"});
    }

    res.status(500).json({mensaje: mensajeGenerico});
};

export const obtenerEventos = async (req, res) => {
    try{
        const eventos = await pool.query(`select * from evento order by id_evento`);

        res.json(eventos.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({mensaje: "no se pudieron obtener los eventos"});
    }
};

export const obtenerEvento = async (req, res) => {
    try{
        const idEvento = parseId(req.params.id);
        if(idEvento === null){
            return res.status(400).json({mensaje: "el id del evento no es valido"});
        }

        const unEvento = await pool.query(`select * from evento where id_evento = $1`, [idEvento]);

        if(unEvento.rows.length === 0){
            return res.status(404).json({mensaje: "ese evento no existe"});
        }

        res.json(unEvento.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({mensaje: "no se pudo obtener el evento"});
    }
};

export const crearEvento = async (req, res) => {
    try{
        const {error, datos} = validarEvento(req.body, {requiereCliente: true});
        if(error){
            return res.status(400).json({mensaje: error});
        }

        const nuevoEvento = await pool.query(
            `insert into evento (id_cliente, tipo_evento, fecha, sede_prevista, cant_asistentes_estimada, necesidades_preferencias, estado, id_organizador, estado_sede)
             values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *`,
            [datos.id_cliente, datos.tipo_evento, datos.fecha, datos.sede_prevista, datos.cant_asistentes_estimada, datos.necesidades_preferencias, datos.estado, datos.id_organizador, datos.estado_sede]
        );

        res.status(201).json(nuevoEvento.rows[0]);

    } catch (error){
        console.error(error);

        responderErrorBD(error, res, "no se pudo crear el evento");
    }
};

export const editarEvento = async (req, res) => {
    try{
        const idEvento = parseId(req.params.id);
        if(idEvento === null){
            return res.status(400).json({mensaje: "el id del evento no es valido"});
        }

        const actual = await pool.query(
            `select tipo_evento, fecha::text as fecha, sede_prevista, cant_asistentes_estimada, necesidades_preferencias, estado, id_organizador, estado_sede
             from evento where id_evento = $1`,
            [idEvento]
        );
        if(actual.rows.length === 0){
            return res.status(404).json({mensaje: "ese evento no existe"});
        }

        const {error, datos} = validarEvento({...actual.rows[0], ...req.body}, {requiereCliente: false});
        if(error){
            return res.status(400).json({mensaje: error});
        }

        const eventoEditado = await pool.query(
            `update evento set tipo_evento = $1, fecha = $2, sede_prevista = $3, cant_asistentes_estimada = $4,
             necesidades_preferencias = $5, estado = $6, id_organizador = $7, estado_sede = $8
             where id_evento = $9 returning *`,
            [datos.tipo_evento, datos.fecha, datos.sede_prevista, datos.cant_asistentes_estimada, datos.necesidades_preferencias, datos.estado, datos.id_organizador, datos.estado_sede, idEvento]
        );

        if(eventoEditado.rows.length === 0){
            return res.status(404).json({mensaje: "ese evento no existe"});
        }

        res.json(eventoEditado.rows[0]);

    } catch(error){
        console.error(error);

        responderErrorBD(error, res, "no se pudo editar el evento");
    }
};

export const eliminarEvento = async (req, res) => {
    try{
        const idEvento = parseId(req.params.id);
        if(idEvento === null){
            return res.status(400).json({mensaje: "el id del evento no es valido"});
        }

        const eliminar = await pool.query(`delete from evento where id_evento = $1 RETURNING *`, [idEvento]);

        if(eliminar.rows.length === 0){
            return res.status(404).json({mensaje: "ese evento no existe"});
        }

        res.json({mensaje: "evento eliminado", evento: eliminar.rows[0]});
    }catch(error){
        console.error(error);

        if(error.code === "23503"){
            return res.status(409).json({mensaje: "no se puede eliminar, el evento tiene propuesta, tareas u otros registros asociados"});
        }

        res.status(500).json({mensaje: "no se pudo eliminar el evento"});
    }
};
