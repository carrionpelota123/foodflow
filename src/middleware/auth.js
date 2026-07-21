const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'restaurante_saas_secret_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    next();
  };
}

function filterByEmpresa(req, res, next) {
  if (req.user.rol === 'superadmin') {
    req.empresaFilter = req.query.empresa_id || null;
  } else {
    req.empresaFilter = req.user.empresa_id;
  }
  next();
}

module.exports = { authenticateToken, requireRole, filterByEmpresa, JWT_SECRET };
