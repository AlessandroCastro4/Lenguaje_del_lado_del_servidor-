import express from 'express';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// ✅ Crear tabla usuarios si no existe
const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(50),
      correo VARCHAR(100)
    );
  `;
  await pool.query(query);
  console.log("📋 Tabla 'usuarios' lista");
};
createTable();

// 📍 Rutas CRUD

// GET → obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST → crear nuevo usuario
app.post('/usuarios', async (req, res) => {
  try {
    const { nombre, correo } = req.body;
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo) VALUES ($1, $2) RETURNING *',
      [nombre, correo]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT → actualizar usuario
app.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo } = req.body;
    const result = await pool.query(
      'UPDATE usuarios SET nombre=$1, correo=$2 WHERE id=$3 RETURNING *',
      [nombre, correo, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE → eliminar usuario
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM usuarios WHERE id=$1', [id]);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
