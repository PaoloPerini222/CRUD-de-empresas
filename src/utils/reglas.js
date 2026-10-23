// RN-08: un encargo solo se confirma si el cliente acepto y estan registrados servicios, importe y
// condiciones (la fecha, la sede y la cantidad estimada las exige el trigger de la base).
export const validarConfirmacion = async (db, idEvento) => {
    const propuesta = await db.query(
        `select p.estado, p.total, p.condiciones_acordadas,
                (select count(*) from detalle_propuesta d where d.id_propuesta = p.id_propuesta and not d.descartado)::int as servicios
         from propuesta p where p.id_evento = $1`,
        [idEvento]
    );

    const datos = propuesta.rows[0];
    if(!datos || datos.estado !== "aceptada"){
        return "para confirmar el encargo el cliente tiene que haber aceptado la propuesta";
    }
    if(datos.servicios === 0){
        return "para confirmar el encargo la propuesta debe tener al menos un servicio";
    }
    if(!(Number(datos.total) > 0)){
        return "para confirmar el encargo la propuesta debe tener un importe";
    }
    if(!datos.condiciones_acordadas?.trim()){
        return "para confirmar el encargo hay que registrar las condiciones acordadas";
    }

    return null;
};
