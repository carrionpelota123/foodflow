const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  try {
    const { nombre_empresa, email_empresa, telefono, nombre_admin, email, password } = req.body;

    if (!nombre_empresa || !email_empresa || !nombre_admin || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const existing = db.prepare('SELECT id FROM empresas WHERE email = ?').get(email_empresa);
    if (existing) {
      return res.status(400).json({ error: 'El email de la empresa ya está registrado' });
    }

    const empresaId = uuidv4();
    const usuarioId = uuidv4();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();
    const fin = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const insertEmpresa = db.prepare(`
      INSERT INTO empresas (id, nombre, email, telefono, plan, suscripcion_inicio, suscripcion_fin)
      VALUES (?, ?, ?, ?, 'basico', ?, ?)
    `);
    const insertUsuario = db.prepare(`
      INSERT INTO usuarios (id, empresa_id, nombre, email, password, rol)
      VALUES (?, ?, ?, ?, ?, 'admin')
    `);

    const transaction = db.transaction(() => {
      insertEmpresa.run(empresaId, nombre_empresa, email_empresa, telefono || null, now, fin);
      insertUsuario.run(usuarioId, empresaId, nombre_admin, email, hashedPassword);

      const defaultCats = ['Entradas', 'Platos Fuertes', 'Bebres', 'Postres'];
      const insertCat = db.prepare('INSERT INTO categorias (id, empresa_id, nombre, orden) VALUES (?, ?, ?, ?)');
      defaultCats.forEach((cat, i) => insertCat.run(uuidv4(), empresaId, cat, i + 1));

      for (let i = 1; i <= 10; i++) {
        db.prepare('INSERT INTO mesas (id, empresa_id, numero, capacidad) VALUES (?, ?, ?, ?)').run(
          uuidv4(), empresaId, i, i <= 4 ? 2 : 4
        );
      }
    });

    transaction();

    const token = jwt.sign(
      { id: usuarioId, empresa_id: empresaId, email, rol: 'admin', funcion: 'administrador', nombre: nombre_admin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, user: { id: usuarioId, nombre: nombre_admin, email, rol: 'admin', funcion: 'administrador' }, empresa_id: empresaId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar' });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const user = db.prepare(`
      SELECT u.*, e.nombre as empresa_nombre, e.activa, e.suscripcion_fin
      FROM usuarios u
      JOIN empresas e ON u.empresa_id = e.id
      WHERE u.email = ?
    `).get(email);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    if (!user.activo) {
      return res.status(403).json({ error: 'Usuario desactivado' });
    }

    if (!user.activa) {
      return res.status(403).json({ error: 'La empresa está desactivada' });
    }

    if (user.suscripcion_fin && new Date(user.suscripcion_fin) < new Date()) {
      return res.status(403).json({ error: 'Suscripción expirada' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user.id, empresa_id: user.empresa_id, email: user.email, rol: user.rol, funcion: user.funcion || 'administrador', nombre: user.nombre },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, funcion: user.funcion || 'administrador', empresa_nombre: user.empresa_nombre },
      empresa_id: user.empresa_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT u.id, u.nombre, u.email, u.rol, u.funcion, u.empresa_id, e.nombre as empresa_nombre, e.plan
      FROM usuarios u JOIN empresas e ON u.empresa_id = e.id
      WHERE u.id = ?
    `).get(req.user.id);

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/empresa', authenticateToken, (req, res) => {
  try {
    const empresa = db.prepare('SELECT id, nombre, email, telefono, direccion, plan FROM empresas WHERE id = ?').get(req.user.empresa_id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(empresa);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/empresa', authenticateToken, (req, res) => {
  try {
    if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
    const { nombre, telefono, direccion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    db.prepare('UPDATE empresas SET nombre = ?, telefono = ?, direccion = ? WHERE id = ?')
      .run(nombre, telefono || null, direccion || null, req.user.empresa_id);
    res.json({ ok: true, nombre });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar empresa' });
  }
});

router.post('/register-user', authenticateToken, (req, res) => {
  try {
    if (req.user.rol !== 'superadmin' && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Sin permisos' });
    }

    const { nombre, email, password, rol, funcion } = req.body;
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const empresa_id = req.user.rol === 'superadmin' ? (req.body.empresa_id || req.user.empresa_id) : req.user.empresa_id;

    const existing = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email ya registrado' });

    const id = uuidv4();
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.prepare('INSERT INTO usuarios (id, empresa_id, nombre, email, password, rol, funcion) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, empresa_id, nombre, email, hashedPassword, rol, funcion || 'administrador');

    res.status(201).json({ id, nombre, email, rol, funcion: funcion || 'administrador' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

module.exports = router;
