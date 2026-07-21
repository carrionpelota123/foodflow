const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/ventas', (req, res) => {
  try {
    const empresaId = req.user.rol === 'superadmin' ? (req.query.empresa_id || req.user.empresa_id) : req.user.empresa_id;
    const { fecha_inicio, fecha_fin } = req.query;

    let query = `
      SELECT DATE(p.cerrado_at) as fecha, COUNT(*) as total_pedidos,
             SUM(p.subtotal) as subtotal, SUM(p.impuestos) as impuestos, SUM(p.total) as total
      FROM pedidos p
      WHERE p.empresa_id = ? AND p.estado = 'cerrado'
    `;
    const params = [empresaId];

    if (fecha_inicio) { query += ' AND DATE(p.cerrado_at) >= ?'; params.push(fecha_inicio); }
    if (fecha_fin) { query += ' AND DATE(p.cerrado_at) <= ?'; params.push(fecha_fin); }

    query += ' GROUP BY DATE(p.cerrado_at) ORDER BY fecha DESC';
    const reporte = db.prepare(query).all(...params);
    res.json(reporte);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
});

router.get('/productos-mas-vendidos', (req, res) => {
  try {
    const empresaId = req.user.rol === 'superadmin' ? (req.query.empresa_id || req.user.empresa_id) : req.user.empresa_id;
    const { fecha_inicio, fecha_fin, limite } = req.query;

    let query = `
      SELECT pr.nombre, pr.precio, SUM(d.cantidad) as total_vendido, SUM(d.subtotal) as total_ingreso
      FROM detalles_pedido d
      JOIN productos pr ON d.producto_id = pr.id
      JOIN pedidos p ON d.pedido_id = p.id
      WHERE p.empresa_id = ? AND p.estado = 'cerrado'
    `;
    const params = [empresaId];

    if (fecha_inicio) { query += ' AND DATE(p.cerrado_at) >= ?'; params.push(fecha_inicio); }
    if (fecha_fin) { query += ' AND DATE(p.cerrado_at) <= ?'; params.push(fecha_fin); }

    query += ' GROUP BY pr.id ORDER BY total_vendido DESC';
    if (limite) { query += ' LIMIT ?'; params.push(parseInt(limite)); }

    const reporte = db.prepare(query).all(...params);
    res.json(reporte);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos más vendidos' });
  }
});

router.get('/cuadre-caja', (req, res) => {
  try {
    const empresaId = req.user.rol === 'superadmin' ? (req.query.empresa_id || req.user.empresa_id) : req.user.empresa_id;
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];

    let caja = db.prepare("SELECT * FROM caja WHERE empresa_id = ? AND fecha = ? AND estado = 'abierta' LIMIT 1").get(empresaId, fecha);
    if (!caja) caja = db.prepare('SELECT * FROM caja WHERE empresa_id = ? AND fecha = ? ORDER BY rowid DESC LIMIT 1').get(empresaId, fecha);

    const pedidosCerrados = db.prepare(`
      SELECT COUNT(*) as total_pedidos, COALESCE(SUM(total), 0) as total_ventas, COALESCE(SUM(impuestos), 0) as total_impuestos
      FROM pedidos
      WHERE empresa_id = ? AND estado = 'cerrado' AND DATE(cerrado_at) = ?
    `).get(empresaId, fecha);

    res.json({
      fecha,
      caja: caja || { estado: 'sin_abrir', monto_inicial: 0 },
      ...pedidosCerrados
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cuadre de caja' });
  }
});

router.post('/caja/abrir', (req, res) => {
  try {
    const empresaId = req.user.empresa_id;
    const fecha = new Date().toISOString().split('T')[0];
    const { monto_inicial } = req.body;

    const existing = db.prepare("SELECT * FROM caja WHERE empresa_id = ? AND fecha = ? AND estado = 'abierta'").get(empresaId, fecha);
    if (existing) return res.status(400).json({ error: 'Ya hay una caja abierta hoy. Cierrala antes de abrir una nueva.' });

    db.prepare("UPDATE caja SET estado = 'cerrada', cerrada_at = datetime('now') WHERE empresa_id = ? AND fecha = ? AND estado = 'abierta'").run(empresaId, fecha);

    const id = uuidv4();
    db.prepare('INSERT INTO caja (id, empresa_id, fecha, monto_inicial) VALUES (?, ?, ?, ?)')
      .run(id, empresaId, fecha, monto_inicial || 0);

    const caja = db.prepare('SELECT * FROM caja WHERE id = ?').get(id);
    res.status(201).json(caja);
  } catch (err) {
    res.status(500).json({ error: 'Error al abrir caja' });
  }
});

router.post('/caja/cerrar', (req, res) => {
  try {
    const empresaId = req.user.empresa_id;
    const fecha = new Date().toISOString().split('T')[0];

    const caja = db.prepare("SELECT * FROM caja WHERE empresa_id = ? AND fecha = ? AND estado = 'abierta'").get(empresaId, fecha);
    if (!caja) return res.status(400).json({ error: 'No hay caja abierta hoy' });

    const resumen = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total_ventas, COALESCE(SUM(impuestos), 0) as total_impuestos
      FROM pedidos WHERE empresa_id = ? AND estado = 'cerrado' AND DATE(cerrado_at) = ?
    `).get(empresaId, fecha);

    db.prepare("UPDATE caja SET estado = 'cerrada', monto_final = monto_inicial + ?, total_ventas = ?, total_impuestos = ?, cerrada_at = datetime('now') WHERE id = ?")
      .run(resumen.total_ventas, resumen.total_ventas, resumen.total_impuestos, caja.id);

    const cerrada = db.prepare('SELECT * FROM caja WHERE id = ?').get(caja.id);
    res.json(cerrada);
  } catch (err) {
    res.status(500).json({ error: 'Error al cerrar caja' });
  }
});

router.get('/dashboard', (req, res) => {
  try {
    const empresaId = req.user.empresa_id;
    const hoy = new Date().toISOString().split('T')[0];

    const mesasTotal = db.prepare('SELECT COUNT(*) as total FROM mesas WHERE empresa_id = ?').get(empresaId);
    const mesasOcupadas = db.prepare("SELECT COUNT(*) as total FROM mesas WHERE empresa_id = ? AND estado = 'ocupada'").get(empresaId);
    const pedidosAbiertos = db.prepare("SELECT COUNT(*) as total FROM pedidos WHERE empresa_id = ? AND estado = 'abierto'").get(empresaId);

    const ventasHoy = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as pedidos
      FROM pedidos WHERE empresa_id = ? AND estado = 'cerrado' AND DATE(cerrado_at) = ?
    `).get(empresaId, hoy);

    const ventasMes = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as pedidos
      FROM pedidos WHERE empresa_id = ? AND estado = 'cerrado' AND strftime('%Y-%m', cerrado_at) = strftime('%Y-%m', 'now')
    `).get(empresaId);

    const productosTop = db.prepare(`
      SELECT pr.nombre, SUM(d.cantidad) as vendido
      FROM detalles_pedido d
      JOIN productos pr ON d.producto_id = pr.id
      JOIN pedidos p ON d.pedido_id = p.id
      WHERE p.empresa_id = ? AND p.estado = 'cerrado' AND DATE(p.cerrado_at) = ?
      GROUP BY pr.id ORDER BY vendido DESC LIMIT 5
    `).all(empresaId, hoy);

    res.json({
      mesas: { total: mesasTotal.total, ocupadas: mesasOcupadas.total },
      pedidos_abiertos: pedidosAbiertos.total,
      ventas_hoy: ventasHoy,
      ventas_mes: ventasMes,
      productos_top: productosTop
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del dashboard' });
  }
});

router.get('/metodos-pago', (req, res) => {
  try {
    const empresaId = req.user.rol === 'superadmin' ? (req.query.empresa_id || req.user.empresa_id) : req.user.empresa_id;
    const { fecha_inicio, fecha_fin } = req.query;

    let query = `
      SELECT metodo_pago, COUNT(*) as total_pedidos, COALESCE(SUM(total), 0) as total_monto
      FROM pedidos
      WHERE empresa_id = ? AND estado = 'cerrado'
    `;
    const params = [empresaId];

    if (fecha_inicio) { query += ' AND DATE(cerrado_at) >= ?'; params.push(fecha_inicio); }
    if (fecha_fin) { query += ' AND DATE(cerrado_at) <= ?'; params.push(fecha_fin); }

    query += ' GROUP BY metodo_pago ORDER BY total_monto DESC';
    const reporte = db.prepare(query).all(...params);
    res.json(reporte);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener metodos de pago' });
  }
});

module.exports = router;
