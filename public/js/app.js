class App {
  constructor() {
    this.user = null;
    this.currentPage = 'dashboard';
    this.currentMesaId = null;
    this.currentPedidoId = null;
    this.currentPedidoMesaNum = null;
    this.posFilterCat = null;
    this.productEmojis = ['🍔','🍕','🌮','🥗','🍝','🍣','🥘','🍜','🍰','☕','🥤','🍺','🧁','🍩','🥞'];
    this.init();
  }

  init() {
    if (api.token) { this.loadUser(); }
    else { this.showLogin(); }
  }

  async loadUser() {
    try {
      this.user = await api.getMe();
      this.showApp();
    } catch {
      api.setToken(null);
      this.showLogin();
    }
  }

  toast(msg, type = 'success') {
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span>${icons[type] || ''}</span> ${msg}`;
    document.body.appendChild(t);
    setTimeout(() => { t.style.animation = 'toastIn 0.3s ease reverse forwards'; setTimeout(() => t.remove(), 300); }, 3000);
  }

  toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const ov = document.querySelector('.sidebar-overlay');
    if (sb) sb.classList.toggle('open');
    if (ov) ov.classList.toggle('visible');
  }

  closeSidebarMobile() {
    const sb = document.getElementById('sidebar');
    const ov = document.querySelector('.sidebar-overlay');
    if (sb) sb.classList.remove('open');
    if (ov) ov.classList.remove('visible');
  }

  formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatMoney(val) {
    return `S/ ${(val || 0).toFixed(2)}`;
  }

  getEmoji(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('taco')) return '🌮';
    if (n.includes('pizza')) return '🍕';
    if (n.includes('burger') || n.includes('hamburg')) return '🍔';
    if (n.includes('ensalada') || n.includes('salad')) return '🥗';
    if (n.includes('pasta') || n.includes('espag')) return '🍝';
    if (n.includes('sushi')) return '🍣';
    if (n.includes('pollo') || n.includes('chicken')) return '🍗';
    if (n.includes('carne') || n.includes('steak')) return '🥩';
    if (n.includes('cerveza') || n.includes('beer')) return '🍺';
    if (n.includes('cafe') || n.includes('coffee')) return '☕';
    if (n.includes('helado') || n.includes('ice')) return '🍦';
    if (n.includes('pastel') || n.includes('cake')) return '🍰';
    if (n.includes('jugo') || n.includes('juice')) return '🧃';
    if (n.includes('agua')) return '💧';
    if (n.includes('sopa')) return '🍜';
    if (n.includes('arroz')) return '🍚';
    if (n.includes('pescado') || n.includes('fish')) return '🐟';
    return this.productEmojis[Math.abs(n.split('').reduce((a,c) => a + c.charCodeAt(0), 0)) % this.productEmojis.length];
  }

  getFuncion() {
    return this.user?.funcion || 'administrador';
  }

  getNavItems() {
    const f = this.getFuncion();
    if (f === 'moso') {
      return [
        { id: 'mesas', icon: '🪑', label: 'Mesas', section: 'Operacion' },
        { id: 'pos', icon: '💳', label: 'Punto de Venta', section: 'Operacion' },
      ];
    }
    if (f === 'cajero') {
      return [
        { id: 'pedidos', icon: '📋', label: 'Pedidos', section: 'Operacion' },
        { id: 'pos', icon: '💳', label: 'Punto de Venta', section: 'Operacion' },
        { id: 'caja', icon: '💰', label: 'Caja', section: 'Administracion' },
      ];
    }
    const items = [
      { id: 'dashboard', icon: '📊', label: 'Dashboard', section: 'Principal' },
      { id: 'mesas', icon: '🪑', label: 'Mesas', section: 'Principal' },
      { id: 'pos', icon: '💳', label: 'Punto de Venta', section: 'Principal' },
      { id: 'menu', icon: '📋', label: 'Menu', section: 'Administracion' },
      { id: 'reportes', icon: '📈', label: 'Reportes', section: 'Administracion' },
      { id: 'caja', icon: '💰', label: 'Caja', section: 'Administracion' },
      { id: 'usuarios', icon: '👥', label: 'Usuarios', section: 'Administracion' },
      { id: 'configuracion', icon: '⚙', label: 'Configuracion', section: 'Administracion' },
    ];
    return items;
  }

  /* ==================== LOGIN ==================== */
  showLogin() {
    document.getElementById('app').innerHTML = `
      <div class="login-container">
        <div class="login-box">
          <div class="login-logo">
            <div class="logo-circle">🍽</div>
            <h1>ECSYSTEM</h1>
            <p>Sistema de Gestion de Restaurantes</p>
          </div>

          <div class="login-tabs" id="login-tabs">
            <button class="tab-btn active" onclick="app.showLoginForm()">Iniciar Sesion</button>
            <button class="tab-btn" onclick="app.showRegisterForm()">Crear Cuenta</button>
          </div>

          <div id="login-form" class="login-form">
            <div class="form-group">
              <label>Correo electronico</label>
              <input type="email" id="login-email" placeholder="tu@email.com" onkeydown="if(event.key==='Enter')app.doLogin()">
            </div>
            <div class="form-group">
              <label>Contrasena</label>
              <input type="password" id="login-password" placeholder="Escribe tu contrasena" onkeydown="if(event.key==='Enter')app.doLogin()">
            </div>
            <button class="btn btn-primary btn-block btn-lg" onclick="app.doLogin()" id="login-btn" style="margin-top:8px">
              Iniciar Sesion
            </button>
            <p class="login-footer-text">Eres nuevo? Haz clic en "Crear Cuenta"</p>
          </div>

          <div id="register-form" class="login-form hidden">
            <div class="form-group">
              <label>Nombre del restaurante</label>
              <input type="text" id="reg-empresa" placeholder="Ej: El Fogoncito">
            </div>
            <div class="form-group">
              <label>Email del restaurante</label>
              <input type="email" id="reg-email-empresa" placeholder="contacto@restaurante.com">
            </div>
            <div class="form-group">
              <label>Telefono</label>
              <input type="text" id="reg-telefono" placeholder="+51 999 888 777">
            </div>
            <div class="form-divider"><span>Datos del administrador</span></div>
            <div class="form-group">
              <label>Tu nombre</label>
              <input type="text" id="reg-nombre" placeholder="Juan Perez">
            </div>
            <div class="form-group">
              <label>Tu correo</label>
              <input type="email" id="reg-email" placeholder="juan@email.com">
            </div>
            <div class="form-group">
              <label>Contrasena</label>
              <input type="password" id="reg-password" placeholder="Minimo 6 caracteres" onkeydown="if(event.key==='Enter')app.doRegister()">
            </div>
            <button class="btn btn-primary btn-block btn-lg" onclick="app.doRegister()" id="reg-btn" style="margin-top:8px">
              Crear Cuenta
            </button>
          </div>

          <div id="login-error" class="login-error hidden"></div>
        </div>
      </div>`;
  }

  showLoginForm() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.querySelectorAll('#login-tabs .tab-btn')[0].classList.add('active');
    document.querySelectorAll('#login-tabs .tab-btn')[1].classList.remove('active');
    document.getElementById('login-error').classList.add('hidden');
  }

  showRegisterForm() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.querySelectorAll('#login-tabs .tab-btn')[0].classList.remove('active');
    document.querySelectorAll('#login-tabs .tab-btn')[1].classList.add('active');
    document.getElementById('login-error').classList.add('hidden');
  }

  showLoginError(msg) {
    const el = document.getElementById('login-error');
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  async doLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    if (!email || !password) { this.showLoginError('Completa todos los campos'); return; }
    btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0"></div> Ingresando...';
    try {
      const data = await api.login(email, password);
      api.setToken(data.token);
      this.user = data.user;
      this.showApp();
    } catch (err) { this.showLoginError(err.message); }
    btn.disabled = false; btn.textContent = 'Iniciar Sesion';
  }

  async doRegister() {
    const data = {
      nombre_empresa: document.getElementById('reg-empresa').value.trim(),
      email_empresa: document.getElementById('reg-email-empresa').value.trim(),
      telefono: document.getElementById('reg-telefono').value.trim(),
      nombre_admin: document.getElementById('reg-nombre').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      password: document.getElementById('reg-password').value,
    };
    const btn = document.getElementById('reg-btn');
    if (!data.nombre_empresa || !data.email_empresa || !data.nombre_admin || !data.email || !data.password) {
      this.showLoginError('Completa todos los campos obligatorios'); return;
    }
    if (data.password.length < 6) { this.showLoginError('La contrasena debe tener al menos 6 caracteres'); return; }
    btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0"></div> Creando...';
    try {
      const result = await api.register(data);
      api.setToken(result.token);
      this.user = result.user;
      this.showApp();
      this.toast('Cuenta creada! Se generaron 10 mesas de ejemplo');
    } catch (err) { this.showLoginError(err.message); }
    btn.disabled = false; btn.textContent = 'Crear Cuenta';
  }

  logout() {
    api.setToken(null);
    this.user = null;
    this.currentPedidoId = null;
    this.currentMesaId = null;
    this.showLogin();
  }

  /* ==================== APP SHELL ==================== */
  showApp() {
    const initials = this.user.nombre ? this.user.nombre.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'U';
    const funcionLabel = { administrador: 'Administrador', moso: 'Moso', cajero: 'Cajero' };
    const navItems = this.getNavItems();
    const sections = [...new Set(navItems.map(n => n.section))];

    const defaultPage = navItems[0]?.id || 'dashboard';
    this.currentPage = navItems.find(n => n.id === this.currentPage) ? this.currentPage : defaultPage;

    document.getElementById('app').innerHTML = `
      <div class="app-layout">
        <div class="sidebar-overlay" onclick="app.toggleSidebar()"></div>
        <button class="hamburger" onclick="app.toggleSidebar()">☰</button>
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-brand">
            <div class="brand-row">
              <div class="brand-icon">🍽</div>
              <div class="brand-text">
                <h2>ECSYSTEM</h2>
                <div class="empresa">${this.user.empresa_nombre || 'Mi Restaurante'}</div>
              </div>
            </div>
          </div>
          <nav class="sidebar-nav">
            ${sections.map(sec => `
              <div class="nav-section-label">${sec}</div>
              ${navItems.filter(n => n.section === sec).map(n => `
                <div class="nav-item ${this.currentPage === n.id ? 'active' : ''}" data-page="${n.id}" onclick="app.navigate('${n.id}'); app.closeSidebarMobile()">
                  <span class="nav-icon">${n.icon}</span>
                  <span class="nav-text">${n.label}</span>
                </div>`).join('')}
            `).join('')}
          </nav>
          <div class="sidebar-footer">
            <div class="sidebar-user">
              <div class="user-avatar">${initials}</div>
              <div class="user-info">
                <div class="user-name">${this.user.nombre}</div>
                <div class="user-role">${funcionLabel[this.getFuncion()] || this.getFuncion()}</div>
              </div>
            </div>
            <button class="sidebar-logout" onclick="app.logout()">Cerrar Sesion</button>
          </div>
        </aside>
        <main class="main-content" id="main-content"></main>
      </div>`;
    this.navigate(this.currentPage);
  }

  navigate(page) {
    this.currentPage = page;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
    const main = document.getElementById('main-content');
    if (main) main.style.animation = 'none';
    if (main) { main.offsetHeight; main.style.animation = ''; }
    switch (page) {
      case 'dashboard': this.renderDashboard(); break;
      case 'mesas': this.renderMesas(); break;
      case 'pos': this.renderPOS(); break;
      case 'menu': this.renderMenu(); break;
      case 'reportes': this.renderReportes(); break;
      case 'caja': this.renderCaja(); break;
      case 'usuarios': this.renderUsuarios(); break;
      case 'configuracion': this.renderConfiguracion(); break;
      case 'pedidos': this.renderPedidosCajero(); break;
    }
  }

  /* ==================== DASHBOARD ==================== */
  async renderDashboard() {
    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="empty-state"><div class="spinner" style="border-color:var(--primary);border-top-color:transparent;width:32px;height:32px"></div></div>';
    try {
      const d = await api.getDashboard();
      const libres = d.mesas.total - d.mesas.ocupadas;
      const porcentajeOcup = d.mesas.total > 0 ? Math.round((d.mesas.ocupadas / d.mesas.total) * 100) : 0;
      main.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Dashboard</h1>
            <div class="subtitle">Resumen general de tu restaurante</div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-bg-icon">🪑</div>
            <div class="stat-top">
              <div class="stat-icon-wrap primary">🪑</div>
              <div class="stat-label">Mesas</div>
            </div>
            <div class="stat-value">${d.mesas.ocupadas}/${d.mesas.total}</div>
            <div class="stat-change ${porcentajeOcup > 50 ? 'down' : 'up'}">${porcentajeOcup}% ocupadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-bg-icon">📋</div>
            <div class="stat-top">
              <div class="stat-icon-wrap warning">📋</div>
              <div class="stat-label">Pedidos Abiertos</div>
            </div>
            <div class="stat-value">${d.pedidos_abiertos}</div>
            <div class="stat-change up">En curso</div>
          </div>
          <div class="stat-card">
            <div class="stat-bg-icon">💰</div>
            <div class="stat-top">
              <div class="stat-icon-wrap success">💰</div>
              <div class="stat-label">Ventas Hoy</div>
            </div>
            <div class="stat-value">${this.formatMoney(d.ventas_hoy.total || 0)}</div>
            <div class="stat-change up">${d.ventas_hoy.pedidos || 0} pedidos</div>
          </div>
          <div class="stat-card">
            <div class="stat-bg-icon">📈</div>
            <div class="stat-top">
              <div class="stat-icon-wrap info">📈</div>
              <div class="stat-label">Ventas del Mes</div>
            </div>
            <div class="stat-value">${this.formatMoney(d.ventas_mes.total || 0)}</div>
            <div class="stat-change up">${d.ventas_mes.pedidos || 0} pedidos</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="card-header">
              <h3>Ventas de Hoy</h3>
              <span class="badge badge-success">${this.formatMoney(d.ventas_hoy.total || 0)}</span>
            </div>
            <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">${d.ventas_hoy.pedidos || 0} pedidos cerrados</p>
            ${libres > 0 ? `<div style="display:flex;gap:8px"><button class="btn btn-primary btn-sm" onclick="app.navigate('mesas')">Ver Mesas</button><button class="btn btn-outline btn-sm" onclick="app.navigate('pos')">Ir al POS</button></div>` : '<p style="color:var(--warning);font-size:13px;font-weight:600">Todas las mesas estan ocupadas</p>'}
          </div>
          <div class="card">
            <div class="card-header">
              <h3>Top Productos Hoy</h3>
              <span class="badge badge-primary">${d.productos_top.length} items</span>
            </div>
            ${d.productos_top.length === 0 ? '<p style="color:var(--text-muted);font-size:13px">Sin ventas hoy</p>' :
            d.productos_top.map((p, i) => `
              <div style="display:flex;align-items:center;gap:12px;padding:8px 0;${i < d.productos_top.length - 1 ? 'border-bottom:1px solid var(--border-light)' : ''}">
                <span style="font-size:20px">${this.getEmoji(p.nombre)}</span>
                <div style="flex:1"><div style="font-size:13px;font-weight:600">${p.nombre}</div></div>
                <span style="font-size:13px;font-weight:700;color:var(--primary)">${p.vendido} uds</span>
              </div>`).join('')}
          </div>
        </div>`;
    } catch (err) { main.innerHTML = `<div class="empty-state"><h4>Error</h4><p>${err.message}</p></div>`; }
  }

  /* ==================== MESAS ==================== */
  async renderMesas() {
    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="empty-state"><div class="spinner" style="border-color:var(--primary);border-top-color:transparent;width:32px;height:32px"></div></div>';
    try {
      const mesas = await api.getMesas();
      const libres = mesas.filter(m => m.estado === 'libre').length;
      const ocupadas = mesas.filter(m => m.estado === 'ocupada').length;
      const reservadas = mesas.filter(m => m.estado === 'reservada').length;
      const f = this.getFuncion();
      const canEdit = f === 'administrador';
      main.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Gestion de Mesas</h1>
            <div class="subtitle">${mesas.length} mesas totales &middot; ${libres} libres &middot; ${ocupadas} ocupadas</div>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-outline btn-sm" onclick="app.renderMesas()">↻ Actualizar</button>
            ${canEdit ? '<button class="btn btn-primary" onclick="app.showModalMesa()">+ Nueva Mesa</button>' : ''}
          </div>
        </div>

        <div class="mesas-grid">
          ${mesas.map(m => `
            <div class="mesa-card ${m.estado}" onclick="app.clickMesa('${m.id}')" style="animation:fadeUp 0.3s ease ${m.numero * 0.03}s both">
              <div class="mesa-indicator"></div>
              <span class="mesa-icon">🪑</span>
              <div class="mesa-num">${m.numero}</div>
              <div class="mesa-cap">👤 ${m.capacidad} personas</div>
              <div class="mesa-status-tag">${m.estado === 'libre' ? 'Libre' : m.estado === 'ocupada' ? 'Ocupada' : 'Reservada'}</div>
            </div>`).join('')}
          ${mesas.length === 0 ? '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🪑</div><h4>Sin mesas</h4><p>Crea tu primera mesa para comenzar</p></div>' : ''}
        </div>`;
    } catch (err) { main.innerHTML = `<div class="empty-state"><h4>Error</h4><p>${err.message}</p></div>`; }
  }

  async clickMesa(mesaId) {
    try {
      const mesa = await api.getMesa(mesaId);
      if (mesa.estado === 'ocupada' || mesa.pedido_actual) {
        this.currentPedidoId = mesa.pedido_actual?.id;
        this.currentMesaId = mesaId;
        this.currentPedidoMesaNum = mesa.numero;
        this.navigate('pos');
        if (this.currentPedidoId) this.loadPedidoActual();
      } else {
        const pedido = await api.createPedido({ mesa_id: mesaId });
        this.currentPedidoId = pedido.id;
        this.currentMesaId = mesaId;
        this.currentPedidoMesaNum = mesa.numero;
        this.toast(`Pedido creado para Mesa ${mesa.numero}`);
        this.navigate('pos');
      }
    } catch (err) { this.toast(err.message, 'error'); }
  }

  showModalMesa(editMesa = null) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>${editMesa ? 'Editar Mesa' : 'Nueva Mesa'}</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Numero de mesa</label>
            <input type="number" id="mesa-num" value="${editMesa?.numero || ''}" placeholder="Ej: 1">
          </div>
          <div class="form-group">
            <label>Capacidad (personas)</label>
            <input type="number" id="mesa-cap" value="${editMesa?.capacidad || 4}" min="1">
          </div>
          <div class="form-group">
            <label>Ubicacion</label>
            <input type="text" id="mesa-ubic" value="${editMesa?.ubicacion || ''}" placeholder="Terraza, Interior, Bar...">
          </div>
        </div>
        <div class="modal-footer">
          ${editMesa ? `<button class="btn btn-danger btn-sm" onclick="app.deleteMesa('${editMesa.id}')">Eliminar</button>` : '<span></span>'}
          <div style="display:flex;gap:8px">
            <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
            <button class="btn btn-primary" onclick="app.saveMesa('${editMesa?.id || ''}')">${editMesa ? 'Guardar' : 'Crear Mesa'}</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  async saveMesa(id) {
    const data = { numero: parseInt(document.getElementById('mesa-num').value), capacidad: parseInt(document.getElementById('mesa-cap').value), ubicacion: document.getElementById('mesa-ubic').value };
    if (!data.numero) { this.toast('Numero requerido', 'error'); return; }
    try {
      if (id) await api.updateMesa(id, data);
      else await api.createMesa(data);
      document.querySelector('.modal-overlay')?.remove();
      this.toast(id ? 'Mesa actualizada' : 'Mesa creada');
      this.renderMesas();
    } catch (err) { this.toast(err.message, 'error'); }
  }

  async deleteMesa(id) {
    if (!confirm('Eliminar esta mesa?')) return;
    try {
      await api.deleteMesa(id);
      document.querySelector('.modal-overlay')?.remove();
      this.toast('Mesa eliminada');
      this.renderMesas();
    } catch (err) { this.toast(err.message, 'error'); }
  }

  /* ==================== POS ==================== */
  async renderPOS() {
    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="empty-state"><div class="spinner" style="border-color:var(--primary);border-top-color:transparent;width:32px;height:32px"></div></div>';
    try {
      const [categorias, productos] = await Promise.all([api.getCategorias(), api.getProductos('disponible=1')]);
      window._posCategorias = categorias;
      window._posProductos = productos;
      const mesaLabel = this.currentPedidoMesaNum ? ` - Mesa ${this.currentPedidoMesaNum}` : '';
      const f = this.getFuncion();
      const canCobrar = f === 'administrador' || f === 'cajero';
      main.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Punto de Venta${mesaLabel}</h1>
            <div class="subtitle">${this.currentPedidoId ? 'Pedido activo' : 'Selecciona una mesa para tomar el pedido'}</div>
          </div>
          <div class="page-header-actions">
            ${this.currentPedidoId ? `<button class="btn btn-danger btn-sm" onclick="app.cancelarPedidoActual()">Cancelar Pedido</button>` : ''}
            <button class="btn btn-outline btn-sm" onclick="app.selectMesaForPos()">Cambiar Mesa</button>
          </div>
        </div>
        <div class="pos-layout">
          <div class="pos-menu">
            <div class="pos-categories" id="pos-categories">
              <button class="cat-btn ${!this.posFilterCat ? 'active' : ''}" onclick="app.filterPosCat(null, this)">Todos</button>
              ${categorias.map(c => `<button class="cat-btn ${this.posFilterCat === c.id ? 'active' : ''}" onclick="app.filterPosCat('${c.id}', this)">${c.nombre}</button>`).join('')}
            </div>
            <div class="pos-products" id="pos-products">${this.renderPosProducts(productos)}</div>
          </div>
          <div class="pos-order" id="pos-order">
            <div class="pos-order-header">
              <h3>🧾 Pedido Actual</h3>
              <span class="order-status" id="pos-order-status">${this.currentPedidoId ? 'Activo' : 'Sin pedido'}</span>
            </div>
            <div class="pos-order-items" id="pos-order-items">
              <div class="empty-state" style="padding:32px"><div class="empty-icon">🛒</div><h4>Sin productos</h4><p>Selecciona productos del menu</p></div>
            </div>
            <div class="pos-order-footer">
              <div class="order-line"><span>Subtotal</span><span id="pos-subtotal">${this.formatMoney(0)}</span></div>
              <div class="order-line"><span>IVA (16%)</span><span id="pos-iva">${this.formatMoney(0)}</span></div>
              <div class="order-line grand-total"><span>Total</span><span id="pos-total">${this.formatMoney(0)}</span></div>
              ${canCobrar ? `
              <button class="btn btn-success btn-block btn-lg" style="margin-top:16px" id="pos-cobrar-btn" onclick="app.cobrarPedido()" ${!this.currentPedidoId ? 'disabled' : ''}>
                💳 Cobrar Pedido
              </button>` : `
              <div style="text-align:center;color:var(--text-muted);font-size:12px;margin-top:12px;padding:12px;background:var(--primary-50);border-radius:8px;border:1px dashed var(--primary-light)">
                <div style="font-size:16px;margin-bottom:4px">🍽</div>
                <div style="font-weight:600;color:var(--primary)">Modo Atencion</div>
                <div style="margin-top:2px">Solo toma de pedidos. El cajero realiza el cobro.</div>
              </div>`}
            </div>
          </div>
        </div>`;
      if (this.currentPedidoId) this.loadPedidoActual();
    } catch (err) { main.innerHTML = `<div class="empty-state"><h4>Error</h4><p>${err.message}</p></div>`; }
  }

  renderPosProducts(productos) {
    if (productos.length === 0) return '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📦</div><h4>Sin productos</h4><p>Agrega productos en la seccion de Menu</p></div>';
    return productos.map(p => `
      <div class="pos-product-card" onclick="app.addProductoToPedido('${p.id}', '${p.nombre.replace(/'/g, "\\'")}', ${p.precio})">
        <span class="prod-emoji">${this.getEmoji(p.nombre)}</span>
        <div class="prod-name">${p.nombre}</div>
        <div class="prod-price">${this.formatMoney(p.precio)}</div>
        <div class="prod-stock">${p.stock >= 0 ? `Stock: ${p.stock}` : 'Sin limite'}</div>
      </div>`).join('');
  }

  filterPosCat(catId, el) {
    this.posFilterCat = catId;
    const filtered = catId ? window._posProductos.filter(p => p.categoria_id === catId) : window._posProductos;
    document.getElementById('pos-products').innerHTML = this.renderPosProducts(filtered);
    document.querySelectorAll('.pos-categories .cat-btn').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
  }

  async addProductoToPedido(productoId, nombre, precio) {
    if (!this.currentPedidoId) {
      if (!this.currentMesaId) { this.toast('Selecciona una mesa primero', 'error'); return; }
      try {
        const pedido = await api.createPedido({ mesa_id: this.currentMesaId });
        this.currentPedidoId = pedido.id;
        document.getElementById('pos-order-status').textContent = 'Activo';
        const cobrarBtn = document.getElementById('pos-cobrar-btn');
        if (cobrarBtn) cobrarBtn.disabled = false;
      } catch (err) { this.toast(err.message, 'error'); return; }
    }
    try {
      await api.addItemPedido(this.currentPedidoId, { producto_id: productoId, cantidad: 1 });
      this.toast(`${nombre} agregado`);
      this.loadPedidoActual();
    } catch (err) { this.toast(err.message, 'error'); }
  }

  async loadPedidoActual() {
    if (!this.currentPedidoId) return;
    try {
      const pedido = await api.getPedido(this.currentPedidoId);
      const itemsEl = document.getElementById('pos-order-items');
      if (!itemsEl) return;
      if (!pedido.detalles || pedido.detalles.length === 0) {
        itemsEl.innerHTML = '<div class="empty-state" style="padding:32px"><div class="empty-icon">🛒</div><h4>Sin productos</h4><p>Selecciona productos del menu</p></div>';
      } else {
        itemsEl.innerHTML = pedido.detalles.map(d => `
          <div class="order-item">
            <div class="item-info">
              <div class="item-name">${this.getEmoji(d.producto_nombre)} ${d.producto_nombre}</div>
              <div class="item-qty">${d.cantidad} x ${this.formatMoney(d.precio_unitario)}</div>
            </div>
            <div class="item-right">
              <span class="item-price">${this.formatMoney(d.subtotal)}</span>
              ${this.getFuncion() !== 'moso' ? `<button class="item-remove" onclick="app.removeItem('${d.id}')" title="Eliminar">&times;</button>` : ''}
            </div>
          </div>`).join('');
      }
      document.getElementById('pos-subtotal').textContent = this.formatMoney(pedido.subtotal);
      document.getElementById('pos-iva').textContent = this.formatMoney(pedido.impuestos);
      document.getElementById('pos-total').textContent = this.formatMoney(pedido.total);
    } catch (err) { console.error(err); }
  }

  async removeItem(itemId) {
    try { await api.removeItemPedido(this.currentPedidoId, itemId); this.loadPedidoActual(); }
    catch (err) { this.toast(err.message, 'error'); }
  }

  async cobrarPedido() {
    if (!this.currentPedidoId) return;
    if (!confirm('Cerrar y cobrar este pedido?')) return;
    try {
      const cerrado = await api.cerrarPedido(this.currentPedidoId);
      const pedidoCompleto = await api.getPedido(this.currentPedidoId);
      this.toast('Pedido cobrado exitosamente');
      const mesaNum = this.currentPedidoMesaNum;
      this.currentPedidoId = null; this.currentMesaId = null; this.currentPedidoMesaNum = null;
      this.showReceiptModal({ ...pedidoCompleto, mesa_numero: mesaNum });
    } catch (err) { this.toast(err.message, 'error'); }
  }

  async cancelarPedidoActual() {
    if (!this.currentPedidoId) return;
    if (!confirm('Cancelar este pedido?')) return;
    try {
      await api.cancelarPedido(this.currentPedidoId);
      this.toast('Pedido cancelado');
      this.currentPedidoId = null; this.currentMesaId = null; this.currentPedidoMesaNum = null;
      this.renderPOS();
    } catch (err) { this.toast(err.message, 'error'); }
  }

  async selectMesaForPos() {
    try {
      const mesas = await api.getMesas();
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
      overlay.innerHTML = `
        <div class="modal" style="max-width:560px">
          <div class="modal-header">
            <h2>Seleccionar Mesa</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="mesas-grid" style="grid-template-columns:repeat(auto-fill,minmax(120px,1fr))">
              ${mesas.map(m => `
                <div class="mesa-card ${m.estado}" onclick="app.setMesaPos('${m.id}', ${m.numero})" style="padding:14px 10px">
                  <span class="mesa-icon" style="font-size:20px">🪑</span>
                  <div class="mesa-num" style="font-size:18px">${m.numero}</div>
                  <div class="mesa-status-tag" style="font-size:9px;padding:2px 8px">${m.estado}</div>
                </div>`).join('')}
            </div>
          </div>
        </div>`;
      document.body.appendChild(overlay);
    } catch (err) { this.toast(err.message, 'error'); }
  }

  async setMesaPos(mesaId, numero) {
    document.querySelector('.modal-overlay')?.remove();
    this.currentMesaId = mesaId;
    this.currentPedidoMesaNum = numero;
    try {
      const mesa = await api.getMesa(mesaId);
      if (mesa.pedido_actual) { this.currentPedidoId = mesa.pedido_actual.id; }
      else { const pedido = await api.createPedido({ mesa_id: mesaId }); this.currentPedidoId = pedido.id; }
      this.renderPOS();
    } catch (err) { this.toast(err.message, 'error'); }
  }

  /* ==================== BOLETA ELECTRONICA ==================== */
  buildBoletaHtml(r) {
    const ruc = '20601234567';
    const boletaNum = `B001-${r.pedido.id.substring(0,8).toUpperCase()}`;
    const items = r.detalles;
    const subtotal = r.pedido.subtotal || 0;
    const igv = r.pedido.impuestos || 0;
    const total = r.pedido.total || 0;

    let itemsRows = items.map(d => {
      const desc = d.producto_nombre;
      return `<tr>
        <td style="padding:2px 0;text-align:left;border-bottom:1px dotted #ccc">${desc}</td>
        <td style="padding:2px 0;text-align:center;border-bottom:1px dotted #ccc">${d.cantidad}</td>
        <td style="padding:2px 0;text-align:right;border-bottom:1px dotted #ccc">${this.formatMoney(d.precio_unitario)}</td>
        <td style="padding:2px 0;text-align:right;border-bottom:1px dotted #ccc;font-weight:700">${this.formatMoney(d.subtotal)}</td>
      </tr>`;
    }).join('');

    const asciiBar = ruc + '|' + boletaNum + '|' + total.toFixed(2) + '|' + r.fechaStr;

    return `
      <div id="boleta-content" style="font-family:'Courier New',Courier,monospace;width:302px;padding:12px 14px;font-size:11px;color:#000;background:#fff;line-height:1.4;margin:0 auto">
        <div style="text-align:center;margin-bottom:6px">
          <div style="font-size:15px;font-weight:900;letter-spacing:1px;text-transform:uppercase">${r.empresa}</div>
          <div style="font-size:10px;margin-top:1px">RUC: ${ruc}</div>
          <div style="font-size:9px;margin-top:1px">Direccion de la Empresa</div>
          <div style="font-size:9px">Telefono: (01) 123-4567</div>
        </div>

        <div style="text-align:center;border-top:1px solid #000;border-bottom:1px solid #000;padding:3px 0;margin:6px 0;font-size:10px;font-weight:700">
          BOLETA DE VENTA ELECTRONICA
        </div>

        <div style="text-align:center;font-size:10px;margin-bottom:4px">
          ${boletaNum}
        </div>

        <div style="border-bottom:1px dashed #ccc;padding-bottom:4px;margin-bottom:4px;font-size:10px">
          <div>Fecha: ${r.fechaStr}  Hora: ${r.horaStr}</div>
          <div>Mesa Nro: ${r.mesaNum}</div>
          <div>Vendedor: ${r.usuario}</div>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:6px">
          <thead>
            <tr style="border-bottom:1px solid #000">
              <th style="text-align:left;padding:2px 0;font-size:9px">Descripcion</th>
              <th style="text-align:center;padding:2px 0;font-size:9px">Cant.</th>
              <th style="text-align:right;padding:2px 0;font-size:9px">P.U.</th>
              <th style="text-align:right;padding:2px 0;font-size:9px">Total</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>

        <div style="border-top:1px solid #000;padding-top:4px;margin-top:2px">
          <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px">
            <span>Op. Gravada:</span><span>${this.formatMoney(subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px">
            <span>IVA (16%):</span><span>${this.formatMoney(igv)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:900;margin-top:4px;padding-top:4px;border-top:1px solid #000">
            <span>IMPORTE TOTAL:</span><span>${this.formatMoney(total)}</span>
          </div>
        </div>

        <div style="text-align:center;margin-top:8px;padding-top:4px;border-top:1px dashed #ccc;font-size:9px;color:#444">
          Representacion impresa de la Boleta de Venta<br>
          electronica. El contribuyente puede<br>
          verificarla utilizando su clave de consulta<br>
          en www.sunat.gob.pe
        </div>

        <div style="text-align:center;margin-top:8px;font-size:20px;letter-spacing:2px;line-height:1">
          |||||||||||||||||||||||||||||||<br>
          <span style="font-size:8px">${asciiBar}</span><br>
          |||||||||||||||||||||||||||||||
        </div>

        <div style="text-align:center;margin-top:8px;font-size:8px;color:#888">
          Software: ECSYSTEM v1.0
        </div>
      </div>`;
  }

  showReceiptModal(pedido) {
    const now = new Date();
    const fechaStr = now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const horaStr = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const empresa = this.user.empresa_nombre || 'ECSYSTEM';
    const mesaNum = pedido.mesa_numero || '-';
    const detalles = pedido.detalles || [];

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    const boletaHtml = this.buildBoletaHtml({ empresa, fechaStr, horaStr, mesaNum, pedido, detalles, usuario: this.user.nombre });

    overlay.innerHTML = `
      <div class="modal" style="max-width:480px">
        <div class="modal-header">
          <h2>Pedido Cobrado</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body" style="padding:16px">
          <div style="background:var(--success-bg);border-radius:12px;padding:14px;text-align:center;margin-bottom:14px">
            <div style="font-size:28px;margin-bottom:2px">✅</div>
            <div style="font-size:14px;font-weight:700;color:var(--success)">Cobro Exitoso</div>
            <div style="font-size:22px;font-weight:800;margin-top:2px">${this.formatMoney(pedido.total)}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Mesa ${mesaNum} &middot; ${fechaStr}</div>
          </div>

          <div style="text-align:center;margin-bottom:12px">
            <button class="btn btn-sm btn-outline" onclick="document.getElementById('boleta-preview-wrap').classList.toggle('hidden')" style="font-size:11px">
              👁 Ver Boleta
            </button>
          </div>
          <div id="boleta-preview-wrap" class="hidden" style="overflow-x:auto;display:flex;justify-content:center;margin-bottom:14px">
            ${boletaHtml}
          </div>

          <div class="form-group" style="margin-bottom:12px">
            <label style="font-size:12px">Enviar boleta por WhatsApp</label>
            <div style="display:flex;gap:8px">
              <input type="tel" id="receipt-phone" placeholder="Ej: 999888777" style="flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius);font-size:13px">
              <button class="btn btn-success btn-sm" onclick="app.shareReceiptWhatsApp()">📱 Enviar</button>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="flex-wrap:wrap;gap:6px;justify-content:center;padding:12px 16px 16px">
          <button class="btn btn-primary btn-sm" onclick="app.downloadBoletaPdf()" style="flex:1;min-width:100px">
            📄 PDF
          </button>
          <button class="btn btn-outline btn-sm" onclick="app.printBoleta()" style="flex:1;min-width:100px">
            🖨 Imprimir
          </button>
          <button class="btn btn-ghost btn-sm" onclick="app.closeReceiptAndRender()" style="width:100%;margin-top:4px">
            Cerrar
          </button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    this._lastReceipt = {
      empresa, fechaStr, horaStr, mesaNum,
      pedido,
      detalles,
      total: this.formatMoney(pedido.total),
      usuario: this.user.nombre,
    };
  }

  downloadBoletaPdf() {
    const r = this._lastReceipt;
    if (!r) return;
    const boletaHtml = this.buildBoletaHtml(r);
    const tmpDiv = document.createElement('div');
    tmpDiv.style.cssText = "position:absolute;left:0;top:0;z-index:9999;background:#fff";
    tmpDiv.innerHTML = boletaHtml;
    document.body.appendChild(tmpDiv);

    if (typeof html2pdf !== 'undefined') {
      html2pdf().set({
        margin: [0, 0, 0, 0],
        filename: `boleta_${r.pedido.id.substring(0,8)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: [80, 160 + r.detalles.length * 5], orientation: 'portrait' }
      }).from(tmpDiv.firstElementChild).save().then(() => {
        tmpDiv.remove();
        this.toast('Boleta PDF descargada');
      }).catch(() => { tmpDiv.remove(); this.toast('Error al generar PDF', 'error'); });
    } else {
      tmpDiv.remove();
      this.toast('Libreria PDF no disponible', 'error');
    }
  }

  printBoleta() {
    const r = this._lastReceipt;
    if (!r) return;
    const boletaHtml = this.buildBoletaHtml(r);
    const printContent = `
      <!DOCTYPE html><html><head><meta charset="utf-8">
      <style>@page{size:80mm auto;margin:0}body{margin:0;padding:8px 4px;font-family:'Courier New',monospace;font-size:11px;color:#000;width:72mm}table{width:100%}td{padding:1px 0}td:last-child{text-align:right}</style>
      </head><body>${boletaHtml}</body></html>`;
    const w = window.open('', '_blank', 'width=320,height=600');
    w.document.write(printContent);
    w.document.close();
    w.onload = () => { w.print(); };
  }

  shareReceiptWhatsApp() {
    const r = this._lastReceipt;
    if (!r) return;
    const phoneEl = document.getElementById('receipt-phone');
    const phone = phoneEl ? phoneEl.value.replace(/\D/g, '') : '';
    if (!phone || phone.length < 7) {
      this.toast('Ingresa un numero de telefono valido (minimo 7 digitos)', 'error');
      if (phoneEl) phoneEl.focus();
      return;
    }

    let msg = `*${r.empresa}*\n`;
    msg += `Boleta de Venta Electronica\n`;
    msg += `-----------------------------------\n`;
    msg += `Fecha: ${r.fechaStr}  Hora: ${r.horaStr}\n`;
    msg += `Mesa: ${r.mesaNum}\n`;
    msg += `Pedido: #${r.pedido.id.substring(0,8).toUpperCase()}\n`;
    msg += `Vendedor: ${r.usuario}\n`;
    msg += `-----------------------------------\n`;
    r.detalles.forEach(d => {
      msg += `${d.producto_nombre}  x${d.cantidad}  ${this.formatMoney(d.subtotal)}\n`;
    });
    msg += `-----------------------------------\n`;
    msg += `Op. Gravada: ${this.formatMoney(r.pedido.subtotal)}\n`;
    msg += `IVA (16%): ${this.formatMoney(r.pedido.impuestos)}\n`;
    msg += `*TOTAL: ${r.total}*\n`;
    msg += `-----------------------------------\n`;
    msg += `Gracias por su preferencia!`;

    const fullPhone = phone.startsWith('51') ? phone : '51' + phone;
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    this.toast('Abriendo WhatsApp...', 'success');
  }

  printBoleta() {
    const r = this._lastReceipt;
    if (!r) return;
    const boletaHtml = this.buildBoletaHtml(r);
    const printContent = `
      <html><head><title>Boleta de Venta</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        body { font-family:'Courier New',monospace; font-size:11px; color:#000; margin:0; padding:4mm; width:72mm; }
        table { width:100%; border-collapse:collapse; font-size:10px; }
        th,td { padding:2px 0; }
      </style></head><body>${boletaHtml.replace(/<div id="boleta-content"[^>]*>/, '<div>').replace(/position:fixed;left:-9999px;[^"]*"/, '')}</body></html>`;

    const w = window.open('', '_blank');
    w.document.write(printContent);
    w.document.close();
    setTimeout(() => { w.print(); }, 500);
  }

  closeReceiptAndRender() {
    document.querySelector('.modal-overlay')?.remove();
    this.renderPOS();
  }

  /* ==================== PEDIDOS (CAJERO) ==================== */
  async renderPedidosCajero() {
    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="empty-state"><div class="spinner" style="border-color:var(--primary);border-top-color:transparent;width:32px;height:32px"></div></div>';
    try {
      const pedidos = await api.getPedidos('estado=abierto');
      main.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Pedidos Abiertos</h1>
            <div class="subtitle">${pedidos.length} pedidos activos</div>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-outline btn-sm" onclick="app.renderPedidosCajero()">↻ Actualizar</button>
          </div>
        </div>
        <div class="card" style="padding:0;overflow:hidden">
          <div class="table-container">
            <table>
              <thead><tr><th>Pedido</th><th>Mesa</th><th>Mesero</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                ${pedidos.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted)">No hay pedidos abiertos</td></tr>' :
                pedidos.map(p => `
                  <tr>
                    <td><strong>#${p.id.substring(0,8).toUpperCase()}</strong></td>
                    <td>${p.mesa_numero ? `Mesa ${p.mesa_numero}` : '-'}</td>
                    <td>${p.usuario_nombre || '-'}</td>
                    <td><strong style="color:var(--primary)">${this.formatMoney(p.total)}</strong></td>
                    <td><span class="badge badge-warning">Abierto</span></td>
                    <td>
                      <button class="btn btn-success btn-sm" onclick="app.cobrarPedidoDirecto('${p.id}')">Cobrar</button>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
    } catch (err) { main.innerHTML = `<div class="empty-state"><h4>Error</h4><p>${err.message}</p></div>`; }
  }

  async cobrarPedidoDirecto(pedidoId) {
    if (!confirm('Cobrar este pedido?')) return;
    try {
      await api.cerrarPedido(pedidoId);
      const pedidoCompleto = await api.getPedido(pedidoId);
      this.toast('Pedido cobrado');
      this.showReceiptModal(pedidoCompleto);
    } catch (err) { this.toast(err.message, 'error'); }
  }

  /* ==================== MENU ==================== */
  async renderMenu() {
    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="empty-state"><div class="spinner" style="border-color:var(--primary);border-top-color:transparent;width:32px;height:32px"></div></div>';
    try {
      const [cats, prods] = await Promise.all([api.getCategorias(), api.getProductos()]);
      main.innerHTML = `
        <div class="page-header">
          <div><h1>Administracion de Menu</h1><div class="subtitle">${prods.length} productos &middot; ${cats.length} categorias</div></div>
        </div>
        <div class="tabs" id="menu-tabs">
          <button class="tab active" onclick="app.showMenuTab('productos', this)">Productos</button>
          <button class="tab" onclick="app.showMenuTab('categorias', this)">Categorias</button>
        </div>
        <div id="menu-tab-productos">
          <div style="margin-bottom:16px"><button class="btn btn-primary" onclick="app.showModalProducto()">+ Nuevo Producto</button></div>
          <div class="card" style="padding:0;overflow:hidden">
            <div class="table-container">
              <table>
                <thead><tr><th>Producto</th><th>Categoria</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  ${prods.map(p => `
                    <tr>
                      <td><div style="display:flex;align-items:center;gap:10px"><span style="font-size:20px">${this.getEmoji(p.nombre)}</span><strong>${p.nombre}</strong></div></td>
                      <td>${p.categoria_nombre || '-'}</td>
                      <td><strong style="color:var(--primary)">${this.formatMoney(p.precio)}</strong></td>
                      <td>${p.stock >= 0 ? `<span class="badge badge-warning">${p.stock}</span>` : '<span class="badge badge-info">Ilimitado</span>'}</td>
                      <td><span class="badge badge-${p.disponible ? 'success' : 'danger'}">${p.disponible ? 'Disponible' : 'Agotado'}</span></td>
                      <td><button class="btn btn-ghost btn-sm" onclick='app.showModalProducto(${JSON.stringify(p).replace(/'/g, "&#39;")})'>Editar</button></td>
                    </tr>`).join('')}
                  ${prods.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted)">No hay productos</td></tr>' : ''}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div id="menu-tab-categorias" class="hidden">
          <div style="margin-bottom:16px"><button class="btn btn-primary" onclick="app.showModalCategoria()">+ Nueva Categoria</button></div>
          <div class="card" style="padding:0;overflow:hidden">
            <div class="table-container">
              <table>
                <thead><tr><th>Nombre</th><th>Orden</th><th>Acciones</th></tr></thead>
                <tbody>
                  ${cats.map(c => `
                    <tr>
                      <td><strong>${c.nombre}</strong></td>
                      <td>${c.orden}</td>
                      <td style="display:flex;gap:4px">
                        <button class="btn btn-ghost btn-sm" onclick="app.showModalCategoria(${JSON.stringify(c).replace(/'/g, "&#39;")})">Editar</button>
                        <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="app.deleteCategoria('${c.id}')">Eliminar</button>
                      </td>
                    </tr>`).join('')}
                  ${cats.length === 0 ? '<tr><td colspan="3" style="text-align:center;padding:32px;color:var(--text-muted)">No hay categorias</td></tr>' : ''}
                </tbody>
              </table>
            </div>
          </div>
        </div>`;
      window._menuCats = cats;
    } catch (err) { main.innerHTML = `<div class="empty-state"><h4>Error</h4><p>${err.message}</p></div>`; }
  }

  showMenuTab(tab, el) {
    document.getElementById('menu-tab-productos').classList.toggle('hidden', tab !== 'productos');
    document.getElementById('menu-tab-categorias').classList.toggle('hidden', tab !== 'categorias');
    document.querySelectorAll('#menu-tabs .tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
  }

  showModalProducto(prod = null) {
    const cats = window._menuCats || [];
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>${prod ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group"><label>Nombre</label><input type="text" id="prod-nombre" value="${prod?.nombre || ''}" placeholder="Ej: Tacos al Pastor"></div>
          <div class="form-group"><label>Categoria</label>
            <select id="prod-cat"><option value="">Seleccionar...</option>
              ${cats.map(c => `<option value="${c.id}" ${prod?.categoria_id === c.id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="form-group"><label>Precio (S/)</label><input type="number" step="0.01" id="prod-precio" value="${prod?.precio || ''}" placeholder="0.00"></div>
            <div class="form-group"><label>Stock (-1 = ilimitado)</label><input type="number" id="prod-stock" value="${prod?.stock ?? -1}"></div>
          </div>
          <div class="form-group"><label>Descripcion</label><input type="text" id="prod-desc" value="${prod?.descripcion || ''}" placeholder="Descripcion opcional"></div>
          <div class="form-group">
            <label class="checkbox-label"><input type="checkbox" id="prod-disp" ${prod?.disponible !== 0 ? 'checked' : ''}> Disponible para venta</label>
          </div>
        </div>
        <div class="modal-footer">
          ${prod ? `<button class="btn btn-danger btn-sm" onclick="app.deleteProducto('${prod.id}')">Eliminar</button>` : '<span></span>'}
          <div style="display:flex;gap:8px">
            <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
            <button class="btn btn-primary" onclick="app.saveProducto('${prod?.id || ''}')">${prod ? 'Guardar' : 'Crear Producto'}</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  async saveProducto(id) {
    const data = {
      nombre: document.getElementById('prod-nombre').value,
      categoria_id: document.getElementById('prod-cat').value,
      precio: parseFloat(document.getElementById('prod-precio').value),
      descripcion: document.getElementById('prod-desc').value,
      stock: parseInt(document.getElementById('prod-stock').value),
      disponible: document.getElementById('prod-disp').checked ? 1 : 0
    };
    if (!data.nombre || !data.categoria_id || isNaN(data.precio)) { this.toast('Completa nombre, categoria y precio', 'error'); return; }
    try {
      if (id) await api.updateProducto(id, data);
      else await api.createProducto(data);
      document.querySelector('.modal-overlay')?.remove();
      this.toast(id ? 'Producto actualizado' : 'Producto creado');
      this.renderMenu();
    } catch (err) { this.toast(err.message, 'error'); }
  }

  async deleteProducto(id) {
    if (!confirm('Eliminar este producto?')) return;
    try { await api.deleteProducto(id); document.querySelector('.modal-overlay')?.remove(); this.toast('Producto eliminado'); this.renderMenu(); }
    catch (err) { this.toast(err.message, 'error'); }
  }

  showModalCategoria(cat = null) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="modal" style="max-width:400px">
        <div class="modal-header">
          <h2>${cat ? 'Editar Categoria' : 'Nueva Categoria'}</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group"><label>Nombre</label><input type="text" id="cat-nombre" value="${cat?.nombre || ''}" placeholder="Ej: Bebidas"></div>
          <div class="form-group"><label>Orden</label><input type="number" id="cat-orden" value="${cat?.orden || 0}"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
          <button class="btn btn-primary" onclick="app.saveCategoria('${cat?.id || ''}')">${cat ? 'Guardar' : 'Crear'}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  async saveCategoria(id) {
    const data = { nombre: document.getElementById('cat-nombre').value, orden: parseInt(document.getElementById('cat-orden').value) || 0 };
    if (!data.nombre) { this.toast('Nombre requerido', 'error'); return; }
    try {
      if (id) await api.updateCategoria(id, data); else await api.createCategoria(data);
      document.querySelector('.modal-overlay')?.remove();
      this.toast(id ? 'Categoria actualizada' : 'Categoria creada');
      this.renderMenu();
    } catch (err) { this.toast(err.message, 'error'); }
  }

  async deleteCategoria(id) {
    if (!confirm('Eliminar esta categoria?')) return;
    try { await api.deleteCategoria(id); this.toast('Categoria eliminada'); this.renderMenu(); }
    catch (err) { this.toast(err.message, 'error'); }
  }

  /* ==================== REPORTES ==================== */
  async renderReportes() {
    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="empty-state"><div class="spinner" style="border-color:var(--primary);border-top-color:transparent;width:32px;height:32px"></div></div>';
    const hoy = new Date().toISOString().split('T')[0];
    const mes = hoy.substring(0, 7);
    try {
      const [ventas, top, dashboard] = await Promise.all([
        api.getReporteVentas(`fecha_inicio=${mes}-01&fecha_fin=${hoy}`),
        api.getTopProductos(`fecha_inicio=${mes}-01&fecha_fin=${hoy}&limite=10`),
        api.getDashboard()
      ]);
      main.innerHTML = `
        <div class="page-header">
          <div><h1>Reportes</h1><div class="subtitle">Resumen de ventas y rendimiento</div></div>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-top"><div class="stat-icon-wrap success">💰</div><div class="stat-label">Ventas del Mes</div></div>
            <div class="stat-value">${this.formatMoney(dashboard.ventas_mes.total || 0)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-top"><div class="stat-icon-wrap primary">📦</div><div class="stat-label">Pedidos del Mes</div></div>
            <div class="stat-value">${dashboard.ventas_mes.pedidos || 0}</div>
          </div>
          <div class="stat-card">
            <div class="stat-top"><div class="stat-icon-wrap info">📅</div><div class="stat-label">Ventas Hoy</div></div>
            <div class="stat-value">${this.formatMoney(dashboard.ventas_hoy.total || 0)}</div>
          </div>
        </div>
        <div class="grid-2">
          <div class="card">
            <div class="card-header"><h3>Productos Mas Vendidos</h3><span class="badge badge-primary">Top ${top.length}</span></div>
            <table>
              <thead><tr><th>Producto</th><th>Vendidos</th><th>Ingreso</th></tr></thead>
              <tbody>
                ${top.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:24px">Sin datos</td></tr>' :
                top.map(p => `<tr><td><div style="display:flex;align-items:center;gap:8px"><span>${this.getEmoji(p.nombre)}</span><strong>${p.nombre}</strong></div></td><td><span class="badge badge-info">${p.total_vendido}</span></td><td><strong style="color:var(--success)">${this.formatMoney(p.total_ingreso)}</strong></td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div class="card">
            <div class="card-header"><h3>Ventas por Dia</h3><span class="badge badge-info">${ventas.length} dias</span></div>
            <table>
              <thead><tr><th>Fecha</th><th>Pedidos</th><th>Total</th></tr></thead>
              <tbody>
                ${ventas.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:24px">Sin datos</td></tr>' :
                ventas.slice(0, 10).map(v => `<tr><td>${v.fecha}</td><td><span class="badge badge-primary">${v.total_pedidos}</span></td><td><strong>${this.formatMoney(v.total)}</strong></td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
    } catch (err) { main.innerHTML = `<div class="empty-state"><h4>Error</h4><p>${err.message}</p></div>`; }
  }

  /* ==================== CAJA ==================== */
  async renderCaja() {
    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="empty-state"><div class="spinner" style="border-color:var(--primary);border-top-color:transparent;width:32px;height:32px"></div></div>';
    const hoy = new Date().toISOString().split('T')[0];
    try {
      const caja = await api.getCuadreCaja(hoy);
      const efectivo = (caja.caja.monto_inicial || 0) + (caja.total_ventas || 0);
      const estado = caja.caja.estado;
      main.innerHTML = `
        <div class="page-header">
          <div><h1>Cuadre de Caja</h1><div class="subtitle">${hoy}</div></div>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-top"><div class="stat-icon-wrap primary">💵</div><div class="stat-label">Fondo de Caja</div></div>
            <div class="stat-value">${this.formatMoney(caja.caja.monto_inicial || 0)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-top"><div class="stat-icon-wrap success">📈</div><div class="stat-label">Total Ventas</div></div>
            <div class="stat-value">${this.formatMoney(caja.total_ventas || 0)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-top"><div class="stat-icon-wrap warning">💰</div><div class="stat-label">Efectivo Esperado</div></div>
            <div class="stat-value">${this.formatMoney(efectivo)}</div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3>Estado de Caja</h3>
            <span class="badge badge-${estado === 'abierta' ? 'success' : estado === 'cerrada' ? 'danger' : 'warning'}">${estado === 'abierta' ? 'Abierta' : estado === 'cerrada' ? 'Cerrada' : 'Sin Abrir'}</span>
          </div>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">Pedidos cerrados hoy: ${caja.total_pedidos || 0} &middot; Impuestos: ${this.formatMoney(caja.total_impuestos || 0)}</p>
          ${estado === 'sin_abrir' || estado === 'cerrada' ? `
            <div class="form-group" style="max-width:300px"><label>Monto Inicial (S/)</label><input type="number" step="0.01" id="caja-inicial" value="0"></div>
            <button class="btn btn-primary" onclick="app.abrirCaja()">Abrir Caja</button>
          ` : `
            <button class="btn btn-danger" onclick="app.cerrarCaja()">Cerrar Caja del Dia</button>
          `}
        </div>`;
    } catch (err) { main.innerHTML = `<div class="empty-state"><h4>Error</h4><p>${err.message}</p></div>`; }
  }

  async abrirCaja() {
    try { await api.abrirCaja({ monto_inicial: parseFloat(document.getElementById('caja-inicial').value) || 0 }); this.toast('Caja abierta'); this.renderCaja(); }
    catch (err) { this.toast(err.message, 'error'); }
  }

  async cerrarCaja() {
    if (!confirm('Cerrar la caja del dia?')) return;
    try { await api.cerrarCaja(); this.toast('Caja cerrada'); this.renderCaja(); }
    catch (err) { this.toast(err.message, 'error'); }
  }

  /* ==================== USUARIOS ==================== */
  async renderUsuarios() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="page-header">
        <div><h1>Gestion de Usuarios</h1><div class="subtitle">Administra los miembros de tu equipo</div></div>
      </div>
      <button class="btn btn-primary" style="margin-bottom:20px" onclick="app.showModalUsuario()">+ Nuevo Usuario</button>
      <div class="card">
        <div class="empty-state" style="padding:24px"><div class="empty-icon">👥</div><h4>Agregar Usuarios</h4><p>Crea cuentas para meseros, cajeros y administradores de tu restaurante.</p></div>
      </div>`;
  }

  showModalUsuario() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="modal" style="max-width:420px">
        <div class="modal-header">
          <h2>Nuevo Usuario</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group"><label>Nombre</label><input type="text" id="usr-nombre" placeholder="Nombre completo"></div>
          <div class="form-group"><label>Email</label><input type="email" id="usr-email" placeholder="email@ejemplo.com"></div>
          <div class="form-group"><label>Contrasena</label><input type="password" id="usr-pass" placeholder="Minimo 6 caracteres"></div>
          <div class="form-group"><label>Rol del Sistema</label>
            <select id="usr-rol">
              <option value="operador">Operador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div class="form-group"><label>Funcion / Puesto</label>
            <select id="usr-funcion">
              <option value="administrador">Administrador (acceso total)</option>
              <option value="cajero">Cajero (cobros y pedidos)</option>
              <option value="moso">Moso (tomar pedidos)</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
          <button class="btn btn-primary" onclick="app.saveUsuario()">Crear Usuario</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  async saveUsuario() {
    const data = {
      nombre: document.getElementById('usr-nombre').value,
      email: document.getElementById('usr-email').value,
      password: document.getElementById('usr-pass').value,
      rol: document.getElementById('usr-rol').value,
      funcion: document.getElementById('usr-funcion').value,
    };
    if (!data.nombre || !data.email || !data.password) { this.toast('Todos los campos son obligatorios', 'error'); return; }
    try { await api.registerUser(data); document.querySelector('.modal-overlay')?.remove(); this.toast('Usuario creado exitosamente'); }
    catch (err) { this.toast(err.message, 'error'); }
  }

  /* ==================== CONFIGURACION ==================== */
  async renderConfiguracion() {
    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="empty-state"><div class="spinner" style="border-color:var(--primary);border-top-color:transparent;width:32px;height:32px"></div></div>';
    try {
      const emp = await api.getEmpresa();
      main.innerHTML = `
        <div class="page-header">
          <div><h1>Configuracion</h1><div class="subtitle">Datos de tu restaurante</div></div>
        </div>
        <div class="card" style="max-width:600px">
          <div class="card-header"><h3>Empresa</h3></div>
          <div class="form-group"><label>Nombre del Restaurante</label><input type="text" id="cfg-nombre" value="${emp.nombre || ''}"></div>
          <div class="form-group"><label>Telefono</label><input type="text" id="cfg-telefono" value="${emp.telefono || ''}"></div>
          <div class="form-group"><label>Direccion</label><input type="text" id="cfg-direccion" value="${emp.direccion || ''}"></div>
          <div class="form-group"><label>Email</label><input type="email" value="${emp.email || ''}" disabled style="opacity:0.6"></div>
          <div class="form-group"><label>Plan</label><input type="text" value="${emp.plan || 'basico'}" disabled style="opacity:0.6"></div>
          <button class="btn btn-primary" onclick="app.saveConfiguracion()">Guardar Cambios</button>
        </div>`;
    } catch (err) { main.innerHTML = `<div class="empty-state"><h4>Error</h4><p>${err.message}</p></div>`; }
  }

  async saveConfiguracion() {
    const nombre = document.getElementById('cfg-nombre').value.trim();
    if (!nombre) { this.toast('El nombre es obligatorio', 'error'); return; }
    try {
      await api.updateEmpresa({
        nombre,
        telefono: document.getElementById('cfg-telefono').value.trim(),
        direccion: document.getElementById('cfg-direccion').value.trim(),
      });
      this.user.empresa_nombre = nombre;
      const brandEl = document.querySelector('.brand-text h2');
      const empresaEl = document.querySelector('.brand-text .empresa');
      if (empresaEl) empresaEl.textContent = nombre;
      this.toast('Configuracion guardada');
    } catch (err) { this.toast(err.message, 'error'); }
  }
}

const app = new App();
