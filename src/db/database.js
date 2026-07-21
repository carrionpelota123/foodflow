const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../restaurant.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS empresas (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    direccion TEXT,
    logo_url TEXT,
    plan TEXT DEFAULT 'basico' CHECK(plan IN ('basico','profesional','empresarial')),
    suscripcion_inicio TEXT,
    suscripcion_fin TEXT,
    activa INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT NOT NULL CHECK(rol IN ('superadmin','admin','operador')),
    funcion TEXT DEFAULT 'administrador' CHECK(funcion IN ('administrador','moso','cajero')),
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE TABLE IF NOT EXISTS categorias (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    nombre TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    activa INTEGER DEFAULT 1,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE TABLE IF NOT EXISTS productos (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    categoria_id TEXT NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL NOT NULL,
    imagen_url TEXT,
    stock INTEGER DEFAULT -1,
    disponible INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
  );

  CREATE TABLE IF NOT EXISTS mesas (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    numero INTEGER NOT NULL,
    capacidad INTEGER DEFAULT 4,
    estado TEXT DEFAULT 'libre' CHECK(estado IN ('libre','ocupada','reservada')),
    ubicacion TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE TABLE IF NOT EXISTS pedidos (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    mesa_id TEXT,
    usuario_id TEXT NOT NULL,
    estado TEXT DEFAULT 'abierto' CHECK(estado IN ('abierto','cerrado','cancelado')),
    subtotal REAL DEFAULT 0,
    impuestos REAL DEFAULT 0,
    total REAL DEFAULT 0,
    notas TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    cerrado_at TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (mesa_id) REFERENCES mesas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  );

  CREATE TABLE IF NOT EXISTS detalles_pedido (
    id TEXT PRIMARY KEY,
    pedido_id TEXT NOT NULL,
    producto_id TEXT NOT NULL,
    cantidad INTEGER DEFAULT 1,
    precio_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    notas TEXT,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
  );

  CREATE TABLE IF NOT EXISTS caja (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    fecha TEXT NOT NULL,
    monto_inicial REAL DEFAULT 0,
    monto_final REAL,
    total_ventas REAL DEFAULT 0,
    total_impuestos REAL DEFAULT 0,
    estado TEXT DEFAULT 'abierta' CHECK(estado IN ('abierta','cerrada')),
    cerrada_at TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON usuarios(empresa_id);
  CREATE INDEX IF NOT EXISTS idx_productos_empresa ON productos(empresa_id);
  CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
  CREATE INDEX IF NOT EXISTS idx_mesas_empresa ON mesas(empresa_id);
  CREATE INDEX IF NOT EXISTS idx_pedidos_empresa ON pedidos(empresa_id);
  CREATE INDEX IF NOT EXISTS idx_pedidos_mesa ON pedidos(mesa_id);
  CREATE INDEX IF NOT EXISTS idx_detalles_pedido ON detalles_pedido(pedido_id);
`);

try {
  const hasFuncion = db.prepare("PRAGMA table_info(usuarios)").all().some(col => col.name === 'funcion');
  if (!hasFuncion) {
    db.exec("ALTER TABLE usuarios ADD COLUMN funcion TEXT DEFAULT 'administrador'");
  }
} catch (e) {}

try {
  const hasMetodoPago = db.prepare("PRAGMA table_info(pedidos)").all().some(col => col.name === 'metodo_pago');
  if (!hasMetodoPago) {
    db.exec("ALTER TABLE pedidos ADD COLUMN metodo_pago TEXT DEFAULT 'efectivo'");
  }
} catch (e) {}

module.exports = db;
