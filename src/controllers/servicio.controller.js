import pool from "../data/db.js";
import {parseId, textoObligatorio, textoOpcional} from "../utils/validaciones.js";

const validarServicio = (body) => {
    const nombre = textoObligatorio(body?.nombre, "el nombre", 100);
    if(nombre.error){
        return {error: nombre.error};
    }

    const descripcion = textoOpcional(body?.descripcion, "la descripcion", 255);
    if(descripcion.error){
        return {error: descripcion.error};
    }

    return {datos: {nombre: nombre.valor, descripcion: descripcion.valor}};
};

export const obtenerServicios = async (req, res) => {
    try{
        const servicios = await pool.query(`select * from servicio order by nombre`);

        res.json(servicios.rows);

    } catch(error){
        console.error(error);

        res.status(500).json({mensaje: "no se pudieron obtener los servicios"});
    }
};

export const obtenerServicio = async (req, res) => {
    try{
        const idServicio = parseId(req.params.id);
        if(idServicio === null){
            return res.status(400).json({mensaje: "el id del servicio no es valido"});
        }

        const servicio = await pool.query(`select * from servicio where id_servicio = $1`, [idServicio]);
        if(servicio.rows.length === 0){
            return res.status(404).json({mensaje: "ese servicio no existe"});
        }

        res.json(servicio.rows[0]);

    } catch(error){
        console.error(error);

        res.status(500).json({mensaje: "no se pudo obtener el servicio"});
    }
};

export const crearServicio = async (req, res) => {
    try{
        const {error, datos} = validarServicio(req.body);
        if(error){
            return res.status(400).json({mensaje: error});
        }

        const creado = await pool.query(
            `insert into servicio (nombre, descripcion) values ($1, $2) returning *`,
            [datos.nombre, datos.descripcion]
        );

        res.status(201).json(creado.rows[0]);

    } catch(error){
        console.error(error);

        res.status(500).json({mensaje: "no se pudo crear el servicio"});
    }
};

export const editarServicio = async (req, res) => {
    try{
        const idServicio = parseId(req.params.id);
        if(idServicio === null){
            return res.status(400).json({mensaje: "el id del servicio no es valido"});
        }

        const actual = await pool.query(`select nombre, descripcion from servicio where id_servicio = $1`, [idServicio]);
        if(actual.rows.length === 0){
            return res.status(404).json({mensaje: "ese servicio no existe"});
        }

        const {error, datos} = validarServicio({...actual.rows[0], ...req.body});
        if(error){
            return res.status(400).json({mensaje: error});
        }

        const editado = await pool.query(
            `update servicio set nombre = $1, descripcion = $2 where id_servicio = $3 returning *`,
            [datos.nombre, datos.descripcion, idServicio]
        );

        res.json(editado.rows[0]);

    } catch(error){
        console.error(error);

        res.status(500).json({mensaje: "no se pudo editar el servicio"});
    }
};

export const eliminarServicio = async (req, res) => {
    try{
        const idServicio = parseId(req.params.id);
        if(idServicio === null){
            return res.status(400).json({mensaje: "el id del servicio no es valido"});
        }

        const eliminado = await pool.query(`delete from servicio where id_servicio = $1 returning *`, [idServicio]);
        if(eliminado.rows.length === 0){
            return res.status(404).json({mensaje: "ese servicio no existe"});
        }

        res.json({mensaje: "servicio eliminado", servicio: eliminado.rows[0]});

    } catch(error){
        console.error(error);

        if(error.code === "23503"){
            return res.status(409).json({mensaje: "no se puede eliminar, el servicio lo usan proveedores, propuestas o exclusiones"});
        }

        res.status(500).json({mensaje: "no se pudo eliminar el servicio"});
    }
};
