import pool from "../data/db.js";

export const obtenerClientes = async (req, res) => {
    try{
        const clientes = await pool.query(`select * from cliente`);

        res.json(clientes.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({mensaje: "error server, en traer los clientes"});
    }
};

export const obtenerCliente = async (req, res) => {
    try{
        const idCliente = Number(req.params.id);
        if(Number.isNaN(idCliente)){
            return res.status(400).json({mensaje: "el id del cliente no es valido"});
        }

        const unCliente = await pool.query(`select * from cliente where id_cliente = $1` , [idCliente]);

        if(unCliente.rows.length === 0){
            return res.status(404).json({mensaje: "ese cliente no existe"});
        }

        res.json(unCliente.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({mensaje: "error server, en traer un solo cliente"});
    }
};

export const crearCliente = async (req, res) => {
    try{
        const {nombre, email, telefono} = req.body ?? {};
        if(!nombre?.trim() || !telefono?.trim()){
            return res.status(400).json({mensaje: "nombre y telefono son obligatorios"});
        }

        const nuevoCliente = await pool.query(
            `insert into cliente (nombre, telefono, email) values ($1, $2, $3) returning *`,
            [nombre.trim(), telefono.trim(), email?.trim() || null]
        );

        res.status(201).json(nuevoCliente.rows[0]);

    } catch (error){
        console.error(error);

        res.status(500).json({mensaje: "no se pudo crear el cliente"});
    }
};

export const editarCliente = async (req, res) => {
    try{
        const idCliente = Number(req.params.id);
        if(Number.isNaN(idCliente)){
            return res.status(400).json({mensaje: "el id del cliente no es valido"});
        }

        const {nombre, email, telefono} = req.body ?? {};
        if(!nombre?.trim() || !telefono?.trim()){
            return res.status(400).json({mensaje: "nombre y telefono son obligatorios"});
        }

        const clienteEditado = await pool.query(
            `update cliente set nombre = $1, telefono = $2, email = $3 where id_cliente = $4 returning *`,
            [nombre.trim(), telefono.trim(), email?.trim() || null, idCliente]
        );

        if(clienteEditado.rows.length === 0){
            return res.status(404).json({mensaje: "ese cliente no existe"});
        }

        res.json(clienteEditado.rows[0]);

    } catch(error){
        console.error(error);

        res.status(500).json({mensaje: "no se pudo editar el cliente"});
    }
};

export const eliminarCliente = async (req, res) => {
    try{
        const idCliente = Number(req.params.id);
        if(Number.isNaN(idCliente)){
            return res.status(400).json({mensaje: "el id del cliente no es valido"});
        }

        const eliminar = await pool.query(`delete from cliente where id_cliente = $1 RETURNING *`, [idCliente]);

        if(eliminar.rows.length === 0){
            return res.status(404).json({mensaje: "ese cliente no existe"});
        }

        res.json({mensaje: "cliente eliminado", cliente: eliminar.rows[0]});
    }catch(error){
        console.error(error);

        if(error.code === "23503"){
            return res.status(409).json({mensaje: "no se puede eliminar, el cliente tiene eventos asociados"});
        }

        res.status(500).json({mensaje: "error server, en eliminar el cliente"});
    }
};
