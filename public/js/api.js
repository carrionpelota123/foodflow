const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers: { ...headers, ...options.headers } });
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        if (endpoint !== '/auth/login' && endpoint !== '/auth/register') {
          this.setToken(null);
          window.app?.logout();
        }
      }
      throw new Error(data.error || 'Error del servidor');
    }
    return data;
  }

  login(email, password) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  }

  register(data) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  }

  getMe() { return this.request('/auth/me'); }
  getEmpresa() { return this.request('/auth/empresa'); }
  updateEmpresa(data) { return this.request('/auth/empresa', { method: 'PUT', body: JSON.stringify(data) }); }
  registerUser(data) { return this.request('/auth/register-user', { method: 'POST', body: JSON.stringify(data) }); }
  getUsuarios() { return this.request('/auth/usuarios'); }
  updateUsuario(id, data) { return this.request(`/auth/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  deleteUsuario(id) { return this.request(`/auth/usuarios/${id}`, { method: 'DELETE' }); }
  changePassword(data) { return this.request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }); }
  getHistorialPedidos(params = '') { return this.request(`/auth/pedidos-historial${params ? '?' + params : ''}`); }

  getMesas() { return this.request('/mesas'); }
  getMesa(id) { return this.request(`/mesas/${id}`); }
  createMesa(data) { return this.request('/mesas', { method: 'POST', body: JSON.stringify(data) }); }
  updateMesa(id, data) { return this.request(`/mesas/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  deleteMesa(id) { return this.request(`/mesas/${id}`, { method: 'DELETE' }); }

  getCategorias() { return this.request('/menu/categorias'); }
  createCategoria(data) { return this.request('/menu/categorias', { method: 'POST', body: JSON.stringify(data) }); }
  updateCategoria(id, data) { return this.request(`/menu/categorias/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  deleteCategoria(id) { return this.request(`/menu/categorias/${id}`, { method: 'DELETE' }); }

  getProductos(params = '') { return this.request(`/menu/productos${params ? '?' + params : ''}`); }
  createProducto(data) { return this.request('/menu/productos', { method: 'POST', body: JSON.stringify(data) }); }
  updateProducto(id, data) { return this.request(`/menu/productos/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  deleteProducto(id) { return this.request(`/menu/productos/${id}`, { method: 'DELETE' }); }

  getPedidos(params = '') { return this.request(`/pedidos${params ? '?' + params : ''}`); }
  getPedido(id) { return this.request(`/pedidos/${id}`); }
  createPedido(data) { return this.request('/pedidos', { method: 'POST', body: JSON.stringify(data) }); }
  addItemPedido(pedidoId, data) { return this.request(`/pedidos/${pedidoId}/items`, { method: 'POST', body: JSON.stringify(data) }); }
  removeItemPedido(pedidoId, itemId) { return this.request(`/pedidos/${pedidoId}/items/${itemId}`, { method: 'DELETE' }); }
  cerrarPedido(id, metodo_pago) { return this.request(`/pedidos/${id}/cerrar`, { method: 'PUT', body: JSON.stringify({ metodo_pago }) }); }
  cancelarPedido(id) { return this.request(`/pedidos/${id}/cancelar`, { method: 'PUT' }); }

  getDashboard() { return this.request('/reportes/dashboard'); }
  getReporteVentas(params = '') { return this.request(`/reportes/ventas${params ? '?' + params : ''}`); }
  getTopProductos(params = '') { return this.request(`/reportes/productos-mas-vendidos${params ? '?' + params : ''}`); }
  getMetodosPago(params = '') { return this.request(`/reportes/metodos-pago${params ? '?' + params : ''}`); }
  getCuadreCaja(fecha) { return this.request(`/reportes/cuadre-caja${fecha ? '?fecha=' + fecha : ''}`); }
  abrirCaja(data) { return this.request('/reportes/caja/abrir', { method: 'POST', body: JSON.stringify(data) }); }
  cerrarCaja() { return this.request('/reportes/caja/cerrar', { method: 'POST' }); }
}

const api = new ApiClient();
