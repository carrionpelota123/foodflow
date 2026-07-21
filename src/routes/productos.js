const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticateToken, filterByEmpresa } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken, filterByEmpresa);

router.get('/categorias', async (req, res) => {
  try {
    const empresaId = req.empresaFilter || req.user.empresa_id;
    const cats = await db.prepare('SELECT * FROM categorias WHERE empresa_id = ? ORDER BY orden').all(empresaId);
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

router.post('/categorias', async (req, res) => {
  try {
    const { nombre, orden } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });

    const id = uuidv4();
    await db.prepare('INSERT INTO categorias (id, empresa_id, nombre, orden) VALUES (?, ?, ?, ?)')
      .run(id, req.user.empresa_id, nombre, orden || 0);

    res.status(201).json({ id, nombre, orden: orden || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

router.put('/categorias/:id', async (req, res) => {
  try {
    const cat = await db.prepare('SELECT * FROM categorias WHERE id = ? AND empresa_id = ?').get(
      req.params.id, req.user.empresa_id
    );
    if (!cat) return res.status(404).json({ error: 'Categoría no encontrada' });

    const { nombre, orden, activa } = req.body;
    await db.prepare('UPDATE categorias SET nombre = ?, orden = ?, activa = ? WHERE id = ?')
      .run(nombre || cat.nombre, orden !== undefined ? orden : cat.orden, activa !== undefined ? activa : cat.activa, req.params.id);

    res.json({ message: 'Categoría actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

router.delete('/categorias/:id', async (req, res) => {
  try {
    const cat = await db.prepare('SELECT * FROM categorias WHERE id = ? AND empresa_id = ?').get(
      req.params.id, req.user.empresa_id
    );
    if (!cat) return res.status(404).json({ error: 'Categoría no encontrada' });

    const prods = await db.prepare('SELECT COUNT(*) as count FROM productos WHERE categoria_id = ?').get(req.params.id);
    if (prods.count > 0) return res.status(400).json({ error: 'No se puede eliminar categoría con productos' });

    await db.prepare('DELETE FROM categorias WHERE id = ?').run(req.params.id);
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

router.get('/productos', async (req, res) => {
  try {
    const empresaId = req.empresaFilter || req.user.empresa_id;
    const { categoria_id, disponible } = req.query;
    let query = 'SELECT p.*, c.nombre as categoria_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.empresa_id = ?';
    const params = [empresaId];

    if (categoria_id) { query += ' AND p.categoria_id = ?'; params.push(categoria_id); }
    if (disponible !== undefined) { query += ' AND p.disponible = ?'; params.push(disponible); }

    query += ' ORDER BY c.orden, p.nombre';
    const productos = await db.prepare(query).all(...params);
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.get('/productos/:id', async (req, res) => {
  try {
    const prod = await db.prepare(`
      SELECT p.*, c.nombre as categoria_nombre
      FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ? AND p.empresa_id = ?
    `).get(req.params.id, req.user.empresa_id);
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(prod);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/productos', async (req, res) => {
  try {
    const { nombre, categoria_id, precio, descripcion, stock, imagen_url } = req.body;
    if (!nombre || !categoria_id || precio === undefined) {
      return res.status(400).json({ error: 'Nombre, categoría y precio son obligatorios' });
    }

    const cat = await db.prepare('SELECT id FROM categorias WHERE id = ? AND empresa_id = ?').get(
      categoria_id, req.user.empresa_id
    );
    if (!cat) return res.status(400).json({ error: 'Categoría no válida' });

    const id = uuidv4();
    await db.prepare('INSERT INTO productos (id, empresa_id, categoria_id, nombre, descripcion, precio, stock, imagen_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, req.user.empresa_id, categoria_id, nombre, descripcion || '', precio, stock || -1, imagen_url || null);

    const prod = await db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
    res.status(201).json(prod);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

router.put('/productos/:id', async (req, res) => {
  try {
    const prod = await db.prepare('SELECT * FROM productos WHERE id = ? AND empresa_id = ?').get(
      req.params.id, req.user.empresa_id
    );
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });

    const { nombre, categoria_id, precio, descripcion, stock, disponible, imagen_url } = req.body;

    await db.prepare(`UPDATE productos SET nombre = ?, categoria_id = ?, precio = ?, descripcion = ?, stock = ?, disponible = ?, imagen_url = ? WHERE id = ?`)
      .run(
        nombre || prod.nombre,
        categoria_id || prod.categoria_id,
        precio !== undefined ? precio : prod.precio,
        descripcion !== undefined ? descripcion : prod.descripcion,
        stock !== undefined ? stock : prod.stock,
        disponible !== undefined ? disponible : prod.disponible,
        imagen_url !== undefined ? imagen_url : prod.imagen_url,
        req.params.id
      );

    const updated = await db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

router.delete('/productos/:id', async (req, res) => {
  try {
    const prod = await db.prepare('SELECT * FROM productos WHERE id = ? AND empresa_id = ?').get(
      req.params.id, req.user.empresa_id
    );
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });

    await db.prepare('DELETE FROM productos WHERE id = ?').run(req.params.id);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
