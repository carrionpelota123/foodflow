const path = require('path');

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS empresas (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    direccion TEXT,
    logo_url TEXT,
    plan TEXT DEFAULT 'basico',
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
    rol TEXT NOT NULL,
    funcion TEXT DEFAULT 'administrador',
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
    estado TEXT DEFAULT 'libre',
    ubicacion TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );
  CREATE TABLE IF NOT EXISTS pedidos (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    mesa_id TEXT,
    usuario_id TEXT NOT NULL,
    estado TEXT DEFAULT 'abierto',
    subtotal REAL DEFAULT 0,
    impuestos REAL DEFAULT 0,
    total REAL DEFAULT 0,
    notas TEXT,
    metodo_pago TEXT DEFAULT 'efectivo',
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
    estado TEXT DEFAULT 'abierta',
    cerrada_at TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );
`;

function createBetterSqliteDb() {
  const Database = require('better-sqlite3');
  const dbPath = process.env.DB_PATH || path.join(__dirname, '../../restaurant.db');
  const db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(SCHEMA);

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

  console.log('[SQLite] Base de datos local conectada');
  return db;
}

let db;

if (TURSO_URL) {
  try {
    const { createClient } = require('@libsql/client');
    const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN || undefined });

    db = {
      _client: client,

      prepare(sql) {
        const self = this;
        return {
          all(...args) {
            return self._client.execute({ sql, args: args.length === 1 && Array.isArray(args[0]) ? args[0] : args }).then(r => r.rows);
          },
          get(...args) {
            return self._client.execute({ sql, args: args.length === 1 && Array.isArray(args[0]) ? args[0] : args }).then(r => r.rows[0] || undefined);
          },
          run(...args) {
            return self._client.execute({ sql, args: args.length === 1 && Array.isArray(args[0]) ? args[0] : args }).then(r => ({ changes: r.rowsAffected, lastInsertRowid: r.lastInsertRowid }));
          }
        };
      },

      async exec(sql) {
        await this._client.executeMultiple(sql);
      },

      async pragma(setting) {
        await this._client.execute(`PRAGMA ${setting}`);
      },

      transaction(fn) {
        const self = this;
        return async function (...args) {
          await self._client.execute('BEGIN');
          try {
            const result = await fn.apply(this, args);
            await self._client.execute('COMMIT');
            return result;
          } catch (err) {
            await self._client.execute('ROLLBACK');
            throw err;
          }
        };
      }
    };

    db.exec(SCHEMA).then(() => {
      console.log('[Turso] Base de datos conectada y sincronizada');
    }).catch(err => {
      console.error('[Turso] Error al inicializar schema:', err.message);
    });

    console.log('[Turso] Cliente configurado');
  } catch (e) {
    console.warn('[DB] @libsql/client no disponible, usando better-sqlite3 como fallback');
    db = createBetterSqliteDb();
  }
} else {
  db = createBetterSqliteDb();
}

module.exports = db;
