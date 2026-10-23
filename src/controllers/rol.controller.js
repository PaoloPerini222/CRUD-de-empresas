import pool from "../data/db.js";

export const obtenerRoles = async (req, res) => {
    try{
        const roles = await pool.query(`select * from rol order by nombre`);

        res.json(roles.rows);

    } catch(error){
        console.error(error);

        res.status(500).json({mensaje: "no se pudieron obtener los roles"});
    }
};
