# API Eventos - CRUD de empresas

API con Node.js + Express + PostgreSQL (Supabase). Prefijo de rutas: `/api/empresas`.

## Puesta en marcha (todos)

1. `git pull`
2. `npm install`
3. Copiar `.env.example` a `.env` y completar los datos de conexión (pedir a Paolo los de Supabase). **El `.env` nunca se sube.**
4. `npm run dev`

## Ya hecho (Persona 1 - Paolo)

- `package.json` (ES Modules, script `dev` con `--watch`), `.gitignore`, `.env.example`
- `database/empresas.sql` (tabla ya creada en Supabase)
- Dependencias: express, cors, dotenv, pg
- `src/data/db.js` (pool de conexión, con SSL para Supabase)

## Reparto

Cada uno trabaja en su rama (`git checkout -b feature/nombre`), hace PR a `main` y otro lo revisa.

### Persona 2 - Servidor (`src/index.js`)

- Línea 1: `import "dotenv/config"`.
- Crear la app Express, usar `cors()` y `express.json()`.
- Montar el router: `app.use("/api/empresas", empresasRouter)`.
- Ruta 404 para rutas inexistentes **al final** (`res.status(404).json({ mensaje: "Ruta no encontrada" })`).
- `app.listen(process.env.PORT)`.

### Persona 3 - Rutas + lectura (GET)

- `src/routes/empresas.routes.js`: define las 5 rutas y las conecta a los controladores:

  | Método | Ruta | Controlador |
  | --- | --- | --- |
  | GET | `/` | `obtenerEmpresas` |
  | GET | `/:id` | `obtenerEmpresa` |
  | POST | `/` | `crearEmpresa` |
  | PUT | `/:id` | `editarEmpresa` |
  | DELETE | `/:id` | `eliminarEmpresa` |

- `src/controllers/empresas.controller.js` (crear el archivo con `import pool from "../data/db.js"`):
  - `obtenerEmpresas`: `SELECT * FROM empresas ORDER BY id_empresa` -> 200.
  - `obtenerEmpresa`: `WHERE id_empresa = $1` -> 200, o 404 si no existe.
- Todo con `try/catch`, `async/await` y respuesta 500 en error.

### Persona 4 - Escritura (POST, PUT, DELETE)

En el mismo `src/controllers/empresas.controller.js`, agregar **debajo** de lo de Persona 3 (para evitar conflictos, esperar a que Persona 3 suba el archivo base):

- `crearEmpresa`: `nombre` y `cuit` obligatorios, si faltan -> 400 con mensaje claro. `INSERT ... RETURNING *` -> 201.
- `editarEmpresa`: `UPDATE ... WHERE id_empresa = $n RETURNING *` -> 200, o 404 si no existe.
- `eliminarEmpresa`: `DELETE ... WHERE id_empresa = $1 RETURNING *` -> 204, o 404 si no existe.

## Reglas

- Nombres exactos de los exports: `obtenerEmpresas`, `obtenerEmpresa`, `crearEmpresa`, `editarEmpresa`, `eliminarEmpresa`.
- El id lo genera la base (SERIAL), nunca el cliente.
- Las consultas con valores usan **parámetros** (`$1`, `$2`...), nunca concatenar texto.
- Si el cuit está repetido (error `23505`), responder 400/409 con mensaje claro.

## Prueba final (todos juntos)

Probar los 5 endpoints con Postman o Thunder Client y reiniciar el servidor para comprobar que los datos siguen.
