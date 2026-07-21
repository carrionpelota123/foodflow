const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticateToken, filterByEmpresa } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken, filterByEmpresa);

router.get('/', async (req, res) => {
  try {
    const empresaId = req.empresaFilter || req.user.empresa_id;
    const { estado, mesa_id } = req.query;
    let query = 'SELECT p.*, m.numero as mesa_numero, u.nombre as usuario_nombre FROM pedidos p LEFT JOIN mesas m ON p.mesa_id = m.id LEFT JOIN usuarios u ON p.usuario_id = u.id WHERE p.empresa_id = ?';
    const params = [empresaId];

    if (estado) { query += ' AND p.estado = ?'; params.push(estado); }
    if (mesa_id) { query += ' AND p.mesa_id = ?'; params.push(mesa_id); }

    query += ' ORDER BY p.created_at DESC';
    const pedidos = await db.prepare(query).all(...params);
    res.json(pedidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pedido = await db.prepare(`
      SELECT p.*, m.numero as mesa_numero, u.nombre as usuario_nombre
      FROM pedidos p
      LEFT JOIN mesas m ON p.mesa_id = m.id
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ? AND p.empresa_id = ?
    `).get(req.params.id, req.user.empresa_id);

    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    const detalles = await db.prepare(`
      SELECT d.*, pr.nombre as producto_nombre
      FROM detalles_pedido d
      JOIN productos pr ON d.producto_id = pr.id
      WHERE d.pedido_id = ?
    `).all(req.params.id);

    res.json({ ...pedido, detalles });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { mesa_id, notas } = req.body;

    if (mesa_id) {
      const mesa = await db.prepare('SELECT * FROM mesas WHERE id = ? AND empresa_id = ?').get(
        mesa_id, req.user.empresa_id
      );
      if (!mesa) return res.status(400).json({ error: 'Mesa no válida' });

      const existing = await db.prepare(
        "SELECT id FROM pedidos WHERE mesa_id = ? AND empresa_id = ? AND estado = 'abierto'"
      ).get(mesa_id, req.user.empresa_id);
      if (existing) return res.status(400).json({ error: 'Ya hay un pedido abierto en esta mesa', pedido_id: existing.id });

      await db.prepare("UPDATE mesas SET estado = 'ocupada' WHERE id = ?").run(mesa_id);
    }

    const id = uuidv4();
    await db.prepare('INSERT INTO pedidos (id, empresa_id, mesa_id, usuario_id, notas) VALUES (?, ?, ?, ?, ?)')
      .run(id, req.user.empresa_id, mesa_id || null, req.user.id, notas || null);

    const pedido = await db.prepare('SELECT * FROM pedidos WHERE id = ?').get(id);
    res.status(201).json(pedido);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

router.post('/:id/items', async (req, res) => {
  try {
    const pedido = await db.prepare('SELECT * FROM pedidos WHERE id = ? AND empresa_id = ?').get(
      req.params.id, req.user.empresa_id
    );
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (pedido.estado !== 'abierto') return res.status(400).json({ error: 'El pedido no está abierto' });

    const { producto_id, cantidad, notas } = req.body;
    if (!producto_id) return res.status(400).json({ error: 'Producto requerido' });

    const producto = await db.prepare('SELECT * FROM productos WHERE id = ? AND empresa_id = ?').get(
      producto_id, req.user.empresa_id
    );
    if (!producto) return res.status(400).json({ error: 'Producto no válido' });
    if (!producto.disponible) return res.status(400).json({ error: 'Producto no disponible' });

    const cant = cantidad || 1;
    if (producto.stock >= 0 && producto.stock < cant) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    const subtotalItem = producto.precio * cant;
    const id = uuidv4();

    await db.prepare('INSERT INTO detalles_pedido (id, pedido_id, producto_id, cantidad, precio_unitario, subtotal, notas) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, req.params.id, producto_id, cant, producto.precio, subtotalItem, notas || null);

    if (producto.stock >= 0) {
      await db.prepare('UPDATE productos SET stock = stock - ? WHERE id = ?').run(cant, producto_id);
    }

    await recalcularPedido(req.params.id);

    const pedidoActualizado = await db.prepare('SELECT * FROM pedidos WHERE id = ?').get(req.params.id);
    const detalles = await db.prepare(`
      SELECT d.*, pr.nombre as producto_nombre
      FROM detalles_pedido d JOIN productos pr ON d.producto_id = pr.id
      WHERE d.pedido_id = ?
    `).all(req.params.id);

    res.status(201).json({ ...pedidoActualizado, detalles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar item' });
  }
});

router.delete('/:id/items/:itemId', async (req, res) => {
  try {
    const pedido = await db.prepare('SELECT * FROM pedidos WHERE id = ? AND empresa_id = ?').get(
      req.params.id, req.user.empresa_id
    );
    if (!pedido || pedido.estado !== 'abierto') return res.status(400).json({ error: 'Pedido no válido' });

    const item = await db.prepare('SELECT * FROM detalles_pedido WHERE id = ? AND pedido_id = ?').get(
      req.params.itemId, req.params.id
    );
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });

    const producto = await db.prepare('SELECT stock FROM productos WHERE id = ?').get(item.producto_id);
    if (producto && producto.stock >= 0) {
      await db.prepare('UPDATE productos SET stock = stock + ? WHERE id = ?').run(item.cantidad, item.producto_id);
    }

    await db.prepare('DELETE FROM detalles_pedido WHERE id = ?').run(req.params.itemId);
    await recalcularPedido(req.params.id);

    const pedidoActualizado = await db.prepare('SELECT * FROM pedidos WHERE id = ?').get(req.params.id);
    const detalles = await db.prepare(`
      SELECT d.*, pr.nombre as producto_nombre
      FROM detalles_pedido d JOIN productos pr ON d.producto_id = pr.id
      WHERE d.pedido_id = ?
    `).all(req.params.id);

    res.json({ ...pedidoActualizado, detalles });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar item' });
  }
});

router.put('/:id/cerrar', async (req, res) => {
  try {
    const pedido = await db.prepare('SELECT * FROM pedidos WHERE id = ? AND empresa_id = ?').get(
      req.params.id, req.user.empresa_id
    );
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (pedido.estado !== 'abierto') return res.status(400).json({ error: 'El pedido ya no está abierto' });

    const { metodo_pago } = req.body;
    const mp = metodo_pago || 'efectivo';
    const now = new Date().toISOString();
    await db.prepare("UPDATE pedidos SET estado = 'cerrado', cerrado_at = ?, metodo_pago = ? WHERE id = ?").run(now, mp, req.params.id);

    if (pedido.mesa_id) {
      const otroAbierto = await db.prepare(
        "SELECT id FROM pedidos WHERE mesa_id = ? AND empresa_id = ? AND estado = 'abierto' AND id != ?"
      ).get(pedido.mesa_id, req.user.empresa_id, req.params.id);

      if (!otroAbierto) {
        await db.prepare("UPDATE mesas SET estado = 'libre' WHERE id = ?").run(pedido.mesa_id);
      }
    }

    const cerrado = await db.prepare('SELECT * FROM pedidos WHERE id = ?').get(req.params.id);
    res.json(cerrado);
  } catch (err) {
    res.status(500).json({ error: 'Error al cerrar pedido' });
  }
});

router.put('/:id/cancelar', async (req, res) => {
  try {
    const pedido = await db.prepare('SELECT * FROM pedidos WHERE id = ? AND empresa_id = ?').get(
      req.params.id, req.user.empresa_id
    );
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    const items = await db.prepare('SELECT * FROM detalles_pedido WHERE pedido_id = ?').all(req.params.id);
    for (const item of items) {
      const prod = await db.prepare('SELECT stock FROM productos WHERE id = ?').get(item.producto_id);
      if (prod && prod.stock >= 0) {
        await db.prepare('UPDATE productos SET stock = stock + ? WHERE id = ?').run(item.cantidad, item.producto_id);
      }
    }

    await db.prepare("UPDATE pedidos SET estado = 'cancelado' WHERE id = ?").run(req.params.id);

    if (pedido.mesa_id) {
      await db.prepare("UPDATE mesas SET estado = 'libre' WHERE id = ?").run(pedido.mesa_id);
    }

    res.json({ message: 'Pedido cancelado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al cancelar pedido' });
  }
});

async function recalcularPedido(pedidoId) {
  const detalles = await db.prepare('SELECT * FROM detalles_pedido WHERE pedido_id = ?').all(pedidoId);
  const subtotal = detalles.reduce((sum, d) => sum + d.subtotal, 0);
  const impuestos = subtotal * 0.16;
  const total = subtotal + impuestos;

  await db.prepare('UPDATE pedidos SET subtotal = ?, impuestos = ?, total = ? WHERE id = ?')
    .run(subtotal, impuestos, total, pedidoId);
}

module.exports = router;
