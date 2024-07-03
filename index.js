const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

app.use(bodyParser.json());
app.use(cors());

app.get('/empresas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM miransdata_licencia');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener empresas');
    }
});

app.get('/empresa/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT licencia,facturacion,servicio,mensaje FROM miransdata_licencia WHERE ruc = $1', [id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener empresa');
    }
});

app.put('/empresa/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { licencia, facturacion, servicio, mensaje } = req.body;
        const licenciaInt = licencia ? 1 : 0;
        const facturacionInt = facturacion ? 1 : 0;
        const servicioInt = servicio ? 1 : 0;
        await pool.query(
            'UPDATE miransdata_licencia SET licencia = $1, facturacion = $2, servicio = $3, mensaje = $4 WHERE ruc = $5',
            [licenciaInt, facturacionInt, servicioInt, mensaje, id]
        );
        console.log(`La empresa ${id} ha sido actualizada con los valores ${licenciaInt}, ${facturacionInt}, ${servicioInt}, ${mensaje}`);
        res.send('Empresa actualizada');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar empresa');
    }
});

app.listen(process.env.PORT, () => {
    console.log(`El servicio esta iniciado en el puerto ${process.env.PORT}`);
});
