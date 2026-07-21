const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticateToken, filterByEmpresa } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken, filterByEmpresa);

router.get('/', async (req, res) => {
  try {
    const empresaId = req.empresaFilter || req.user.empresa_id;
    const mesas = await db.prepare('SELECT * FROM mesas WHERE empresa_id = ? ORDER BY numero').all(empresaId);
    res.json(mesas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener mesas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const mesa = await db.prepare('SELECT * FROM mesas WHERE id = ? AND empresa_id = ?').get(
      req.params.id, req.user.empresa_id
    );
    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });

    const pedido = await db.prepare(
      "SELECT * FROM pedidos WHERE mesa_id = ? AND empresa_id = ? AND estado = 'abierto'"
    ).get(req.params.id, req.user.empresa_id);

    res.json({ ...mesa, pedido_actual: pedido || null });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { numero, capacidad, ubicacion } = req.body;
    if (!numero) return res.status(400).json({ error: 'Número de mesa requerido' });

    const existing = await db.prepare(
      'SELECT id FROM mesas WHERE numero = ? AND empresa_id = ?'
    ).get(numero, req.user.empresa_id);
    if (existing) return res.status(400).json({ error: 'Ya existe una mesa con ese número' });

    const id = uuidv4();
    await db.prepare('INSERT INTO mesas (id, empresa_id, numero, capacidad, ubicacion) VALUES (?, ?, ?, ?, ?)')
      .run(id, req.user.empresa_id, numero, capacidad || 4, ubicacion || null);

    const mesa = await db.prepare('SELECT * FROM mesas WHERE id = ?').get(id);
    res.status(201).json(mesa);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear mesa' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { numero, capacidad, estado, ubicacion } = req.body;
    const mesa = await db.prepare('SELECT * FROM mesas WHERE id = ? AND empresa_id = ?').get(
      req.params.id, req.user.empresa_id
    );
    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });

    await db.prepare('UPDATE mesas SET numero = ?, capacidad = ?, estado = ?, ubicacion = ? WHERE id = ?')
      .run(
        numero || mesa.numero,
        capacidad || mesa.capacidad,
        estado || mesa.estado,
        ubicacion !== undefined ? ubicacion : mesa.ubicacion,
        req.params.id
      );

    const updated = await db.prepare('SELECT * FROM mesas WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar mesa' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const mesa = await db.prepare('SELECT * FROM mesas WHERE id = ? AND empresa_id = ?').get(
      req.params.id, req.user.empresa_id
    );
    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });

    if (mesa.estado === 'ocupada') {
      return res.status(400).json({ error: 'No se puede eliminar una mesa ocupada' });
    }

    await db.prepare('DELETE FROM mesas WHERE id = ?').run(req.params.id);
    res.json({ message: 'Mesa eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar mesa' });
  }
});

module.exports = router;
