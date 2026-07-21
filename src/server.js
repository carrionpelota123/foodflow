const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const mesasRoutes = require('./routes/mesas');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const reportesRoutes = require('./routes/reportes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/menu', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/reportes', reportesRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  =========================================`);
  console.log(`   Restaurante SaaS - Servidor activo`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://192.168.18.133:${PORT}`);
  console.log(`  =========================================\n`);
});
