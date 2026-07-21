class App {
  constructor() {
    this.user = null;
    this.currentPage = 'dashboard';
    this.currentMesaId = null;
    this.currentPedidoId = null;
    this.currentPedidoMesaNum = null;
    this.currentMesaCap = null;
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

  showConfirm(title, message, icon = '🗑️', confirmText = 'Eliminar', danger = true) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'confirm-overlay';
      overlay.innerHTML = `
        <div class="confirm-dialog">
          <div class="confirm-dialog-icon ${danger ? '' : 'warning'}">${icon}</div>
          <h3 class="confirm-dialog-title">${title}</h3>
          <p class="confirm-dialog-message">${message}</p>
          <div class="confirm-dialog-actions">
            <button class="btn btn-outline" id="confirm-cancel">Cancelar</button>
            <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-ok">${confirmText}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      
      overlay.querySelector('#confirm-cancel').onclick = () => { overlay.remove(); resolve(false); };
      overlay.querySelector('#confirm-ok').onclick = () => { overlay.remove(); resolve(true); };
      overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
    });
  }

  animateCounter(el, target, duration = 800) {
    const start = 0;
    const startTime = performance.now();
    const isMoney = el.textContent.includes('S/');
    const prefix = isMoney ? 'S/ ' : '';
    
    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * eased);
      el.textContent = prefix + current.toFixed(isMoney ? 2 : 0);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  spawnConfetti() {
    const colors = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDelay = Math.random() * 0.8 + 's';
      p.style.animationDuration = (2 + Math.random() * 1.5) + 's';
      p.style.width = (6 + Math.random() * 6) + 'px';
      p.style.height = (6 + Math.random() * 6) + 'px';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 4000);
    }
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

  toggleMobileUserMenu(e) {
    e?.stopPropagation();
    const menu = document.getElementById('mobile-user-menu');
    if (menu) menu.classList.toggle('visible');
  }

  closeMobileUserMenu() {
    const menu = document.getElementById('mobile-user-menu');
    if (menu) menu.classList.remove('visible');
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
        { id: 'pos', icon: '💳', label: 'POS', section: 'Operacion' },
      ];
    }
    if (f === 'cajero') {
      return [
        { id: 'pedidos', icon: '📋', label: 'Pedidos', section: 'Operacion' },
        { id: 'pos', icon: '💳', label: 'POS', section: 'Operacion' },
        { id: 'caja', icon: '💰', label: 'Caja', section: 'Admin' },
        { id: 'historial', icon: '📜', label: 'Historial', section: 'Admin' },
      ];
    }
    const items = [
      { id: 'dashboard', icon: '📊', label: 'Dashboard', section: 'Principal' },
      { id: 'mesas', icon: '🪑', label: 'Mesas', section: 'Principal' },
      { id: 'pos', icon: '💳', label: 'POS', section: 'Principal' },
      { id: 'historial', icon: '📜', label: 'Historial', section: 'Principal' },
      { id: 'menu', icon: '📋', label: 'Menu', section: 'Admin' },
      { id: 'reportes', icon: '📈', label: 'Reportes', section: 'Admin' },
      { id: 'caja', icon: '💰', label: 'Caja', section: 'Admin' },
      { id: 'usuarios', icon: '👥', label: 'Usuarios', section: 'Admin' },
      { id: 'configuracion', icon: '⚙', label: 'Config', section: 'Admin' },
    ];
    return items;
  }

  /* ==================== LOGIN ==================== */
  showLogin() {
    const floatingIcons = ['🍕','🍔','🌮','🍣','🥗','🍝','🍜','🥘','🍰','☕','🥤','🍺','🧁','🍩','🥞','🥑','🍗','🥩','🧀','🥚'];
    const particles = Array.from({length: 40}, (_, i) => {
      const size = 2 + Math.random() * 4;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const dur = 3 + Math.random() * 7;
      const delay = Math.random() * 5;
      const opacity = 0.15 + Math.random() * 0.35;
      return `<div class="login-particle" style="left:${x}%;top:${y}%;width:${size}px;height:${size}px;animation-duration:${dur}s;animation-delay:${delay}s;opacity:${opacity}"></div>`;
    }).join('');
    const floatingFood = floatingIcons.map((icon, i) => {
      const x = 5 + Math.random() * 90;
      const y = 5 + Math.random() * 90;
      const dur = 4 + Math.random() * 6;
      const delay = Math.random() * 3;
      const size = 20 + Math.random() * 20;
      const op = 0.08 + Math.random() * 0.12;
      return `<div class="login-floating-icon" style="left:${x}%;top:${y}%;font-size:${size}px;animation-duration:${dur}s;animation-delay:${delay}s;opacity:${op}">${icon}</div>`;
    }).join('');

    document.getElementById('app').innerHTML = `
      <div class="login-container">
        <div class="login-bg-grid"></div>
        ${particles}
        ${floatingFood}
        <div class="login-orb login-orb-1"></div>
        <div class="login-orb login-orb-2"></div>
        <div class="login-orb login-orb-3"></div>
        <div class="login-orb login-orb-4"></div>

        <div class="login-clock" id="login-clock"></div>

        <div class="login-main-layout">
          <div class="login-left-panel">
            <div class="login-hero">
              <div class="login-hero-badge">Sistema SaaS v1.0</div>
              <h1 class="login-hero-title">ECSYSTEM</h1>
              <p class="login-hero-subtitle">Sistema de Gestion Inteligente para Restaurantes</p>
              <div class="login-hero-features">
                <div class="login-feature-item"><span class="feature-icon">📊</span><span>Dashboard en tiempo real</span></div>
                <div class="login-feature-item"><span class="feature-icon">🍽</span><span>Gestion de mesas y pedidos</span></div>
                <div class="login-feature-item"><span class="feature-icon">💰</span><span>Control de caja y reportes</span></div>
                <div class="login-feature-item"><span class="feature-icon">📱</span><span>Compatible con movil</span></div>
              </div>
            </div>
          </div>

          <div class="login-right-panel">
            <div class="login-box">
              <div class="login-logo">
                <div class="logo-circle">
                  <span>🍽</span>
                </div>
                <h1>Bienvenido</h1>
                <p>Ingresa a tu cuenta o crea una nueva</p>
              </div>

              <div class="login-tabs" id="login-tabs">
                <button class="tab-btn active" onclick="app.showLoginForm()">Iniciar Sesion</button>
                <button class="tab-btn" onclick="app.showRegisterForm()">Crear Cuenta</button>
              </div>

              <div id="login-form" class="login-form">
                <div class="form-group floating-group">
                  <input type="email" id="login-email" placeholder=" " onkeydown="if(event.key==='Enter')app.doLogin()">
                  <label>Correo electronico</label>
                  <span class="input-icon">✉</span>
                </div>
                <div class="form-group floating-group">
                  <input type="password" id="login-password" placeholder=" " onkeydown="if(event.key==='Enter')app.doLogin()">
                  <label>Contrasena</label>
                  <span class="input-icon">🔒</span>
                </div>
                <button class="btn btn-primary btn-block btn-lg btn-shimmer" onclick="app.doLogin()" id="login-btn" style="margin-top:12px">
                  Iniciar Sesion
                </button>
                <p class="login-footer-text">Eres nuevo? Haz clic en <strong>"Crear Cuenta"</strong></p>
              </div>

              <div id="register-form" class="login-form hidden">
                <div class="form-group floating-group">
                  <input type="text" id="reg-empresa" placeholder=" ">
                  <label>Nombre del restaurante</label>
                  <span class="input-icon">🏪</span>
                </div>
                <div class="form-group floating-group">
                  <input type="email" id="reg-email-empresa" placeholder=" ">
                  <label>Email del restaurante</label>
                  <span class="input-icon">✉</span>
                </div>
                <div class="form-group floating-group">
                  <input type="text" id="reg-telefono" placeholder=" ">
                  <label>Telefono</label>
                  <span class="input-icon">📱</span>
                </div>
                <div class="form-divider"><span>Datos del administrador</span></div>
                <div class="form-group floating-group">
                  <input type="text" id="reg-nombre" placeholder=" ">
                  <label>Tu nombre</label>
                  <span class="input-icon">👤</span>
                </div>
                <div class="form-group floating-group">
                  <input type="email" id="reg-email" placeholder=" ">
                  <label>Tu correo</label>
                  <span class="input-icon">✉</span>
                </div>
                <div class="form-group floating-group">
                  <input type="password" id="reg-password" placeholder=" " onkeydown="if(event.key==='Enter')app.doRegister()">
                  <label>Contrasena</label>
                  <span class="input-icon">🔒</span>
                </div>
                <button class="btn btn-primary btn-block btn-lg btn-shimmer" onclick="app.doRegister()" id="reg-btn" style="margin-top:12px">
                  Crear Cuenta
                </button>
              </div>

              <div id="login-error" class="login-error hidden"></div>
            </div>
          </div>
        </div>

        <div class="login-footer-bar">
          <button class="login-contact-btn" onclick="app.showContactModal()">
            <span>💬</span> Contactanos
          </button>
        </div>

        <div class="login-watermark">
          <span>Ing. Erick Carrion</span>
          <span class="login-watermark-sub">v1.0 &middot; ECSYSTEM</span>
        </div>
      </div>`;
    this.startLoginClock();
  }

  showContactModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:440px">
        <div class="modal-header" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 24px 20px;border-radius:24px 24px 0 0">
          <div>
            <h2 style="color:white;margin-bottom:4px">Contactanos</h2>
            <p style="color:rgba(255,255,255,0.7);font-size:13px">Estamos aqui para ayudarte</p>
          </div>
          <button class="modal-close" style="background:rgba(255,255,255,0.2);color:white;border:none" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>
        <div class="modal-body" style="padding:28px 24px">
          <div style="text-align:center;margin-bottom:28px">
            <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#f43f5e);display:inline-flex;align-items:center;justify-content:center;font-size:36px;margin-bottom:14px;box-shadow:0 8px 30px rgba(99,102,241,0.3)">👨‍💻</div>
            <h3 style="font-size:20px;font-weight:700;color:var(--text);margin-bottom:4px">Ing. Erick Carrion Salazar</h3>
            <p style="font-size:13px;color:var(--text-muted)">Desarrollador del Sistema</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--bg);border-radius:14px;transition:all 0.2s;cursor:pointer" onmouseover="this.style.background='var(--primary-50)'" onmouseout="this.style.background='var(--bg)'">
              <div style="width:44px;height:44px;border-radius:12px;background:var(--success-bg);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">📱</div>
              <div><p style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;font-weight:600;margin-bottom:2px">Telefono</p><p style="font-size:16px;font-weight:700;color:var(--text)">956 071 379</p></div>
            </div>
            <div style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--bg);border-radius:14px;transition:all 0.2s;cursor:pointer" onmouseover="this.style.background='var(--primary-50)'" onmouseout="this.style.background='var(--bg)'">
              <div style="width:44px;height:44px;border-radius:12px;background:var(--danger-bg);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">✉️</div>
              <div><p style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;font-weight:600;margin-bottom:2px">Correo</p><p style="font-size:16px;font-weight:700;color:var(--text);word-break:break-all">carrionerick53@gmail.com</p></div>
            </div>
            <div style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--bg);border-radius:14px;transition:all 0.2s;cursor:pointer" onmouseover="this.style.background='var(--primary-50)'" onmouseout="this.style.background='var(--bg)'">
              <div style="width:44px;height:44px;border-radius:12px;background:var(--info-bg);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">🌐</div>
              <div><p style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;font-weight:600;margin-bottom:2px">Sistema</p><p style="font-size:16px;font-weight:700;color:var(--text)">ECSYSTEM v1.0</p></div>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding:0 24px 24px">
          <a href="https://wa.me/51956071379" target="_blank" class="btn btn-success btn-block btn-shimmer" style="border-radius:14px">
            <span>💬</span> WhatsApp
          </a>
          <a href="mailto:carrionerick53@gmail.com" class="btn btn-primary btn-block btn-shimmer" style="border-radius:14px">
            <span>✉</span> Enviar Correo
          </a>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }

  startLoginClock() {
    const update = () => {
      const el = document.getElementById('login-clock');
      if (!el) return;
      const now = new Date();
      el.textContent = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    update();
    this._loginClockInterval = setInterval(update, 1000);
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
        <header class="mobile-header">
          <div class="mobile-header-left">
            <div class="mobile-header-brand">🍽</div>
            <div>
              <div class="mobile-header-title">ECSYSTEM</div>
              <div class="mobile-header-sub">${this.user.empresa_nombre || ''}</div>
            </div>
          </div>
          <div class="mobile-header-right">
            <button class="mobile-header-menu" onclick="app.toggleMobileUserMenu(event)">⋮</button>
            <div class="mobile-header-avatar" onclick="app.toggleMobileUserMenu(event)">${initials}</div>
          </div>
        </header>
        <div class="mobile-user-menu" id="mobile-user-menu">
          <div style="padding:8px 12px;border-bottom:1px solid var(--border-light);margin-bottom:4px">
            <div style="font-weight:600;font-size:14px;color:var(--text)">${this.user.nombre}</div>
            <div style="font-size:12px;color:var(--text-muted)">${funcionLabel[this.getFuncion()] || this.getFuncion()}</div>
          </div>
          <div class="mobile-user-menu-item" onclick="app.navigate('configuracion'); app.closeMobileUserMenu()">⚙ Configuracion</div>
          <div class="mobile-user-menu-item danger" onclick="app.logout()">🚪 Cerrar Sesion</div>
        </div>
        <main class="main-content" id="main-content"></main>
        <nav class="bottom-nav" id="bottom-nav">
          ${navItems.slice(0, 5).map(n => `
            <div class="bottom-nav-item ${this.currentPage === n.id ? 'active' : ''}" data-bpage="${n.id}" onclick="app.navigate('${n.id}')">
              <span class="bottom-nav-icon">${n.icon}</span>
              <span class="bottom-nav-label">${n.label}</span>
            </div>`).join('')}
        </nav>
      </div>`;
    this.navigate(this.currentPage);
  }

  navigate(page) {
    this.currentPage = page;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
    document.querySelectorAll('.bottom-nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-bpage="${page}"]`)?.classList.add('active');
    const main = document.getElementById('main-content');
    const transitions = ['pageIn', 'slideInLeft', 'slideInRight', 'scaleIn'];
    const randomTrans = transitions[Math.floor(Math.random() * transitions.length)];
    if (main) main.style.animation = 'none';
    if (main) { main.offsetHeight; main.style.animation = `${randomTrans} 0.4s cubic-bezier(0.16,1,0.3,1)`; }
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
      case 'historial': this.renderHistorial(); break;
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
        <div class="gradient-header">
          <h1>Dashboard</h1>
          <div class="subtitle">Resumen de ${this.user.empresa_nombre || 'tu restaurante'}</div>
        </div>

        <div class="stats-grid" data-stagger>
          <div class="stat-card fade-up fade-up-1">
            <div class="stat-bg-icon">🪑</div>
            <div class="stat-top">
              <div class="stat-icon-wrap primary">🪑</div>
              <div class="stat-label">Mesas</div>
            </div>
            <div class="stat-value">${d.mesas.ocupadas}/${d.mesas.total}</div>
            <div class="stat-change ${porcentajeOcup > 50 ? 'down' : 'up'}">${porcentajeOcup}% ocupadas</div>
          </div>
          <div class="stat-card fade-up fade-up-2">
            <div class="stat-bg-icon">📋</div>
            <div class="stat-top">
              <div class="stat-icon-wrap warning">📋</div>
              <div class="stat-label">Pedidos Abiertos</div>
            </div>
            <div class="stat-value">${d.pedidos_abiertos}</div>
            <div class="stat-change up"><span class="pulse-dot active"></span> En curso</div>
          </div>
          <div class="stat-card fade-up fade-up-3">
            <div class="stat-bg-icon">💰</div>
            <div class="stat-top">
              <div class="stat-icon-wrap success">💰</div>
              <div class="stat-label">Ventas Hoy</div>
            </div>
            <div class="stat-value">${this.formatMoney(d.ventas_hoy.total || 0)}</div>
            <div class="stat-change up">${d.ventas_hoy.pedidos || 0} pedidos</div>
          </div>
          <div class="stat-card fade-up fade-up-4">
            <div class="stat-bg-icon">📈</div>
            <div class="stat-top">
              <div class="stat-icon-wrap info">📈</div>
              <div class="stat-label">Ventas del Mes</div>
            </div>
            <div class="stat-value">${this.formatMoney(d.ventas_mes.total || 0)}</div>
            <div class="stat-change up">${d.ventas_mes.pedidos || 0} pedidos</div>
          </div>
        </div>

        <div class="quick-actions">
          <div class="quick-action-card fade-up fade-up-1" onclick="app.navigate('mesas')">
            <div class="quick-action-icon" style="background:var(--primary-50)">🪑</div>
            <div class="quick-action-label">Mesas</div>
            <div class="quick-action-count">${libres}</div>
            <div class="quick-action-label" style="font-size:10px;color:var(--text-muted)">libres</div>
          </div>
          <div class="quick-action-card fade-up fade-up-2" onclick="app.navigate('pos')">
            <div class="quick-action-icon" style="background:var(--success-bg)">💳</div>
            <div class="quick-action-label">POS</div>
          </div>
          <div class="quick-action-card fade-up fade-up-3" onclick="app.navigate('historial')">
            <div class="quick-action-icon" style="background:var(--warning-bg)">📜</div>
            <div class="quick-action-label">Historial</div>
          </div>
          <div class="quick-action-card fade-up fade-up-4" onclick="app.navigate('reportes')">
            <div class="quick-action-icon" style="background:var(--info-bg)">📈</div>
            <div class="quick-action-label">Reportes</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card fade-up fade-up-3">
            <div class="card-header">
              <h3>Ventas de Hoy</h3>
              <span class="badge badge-success">${this.formatMoney(d.ventas_hoy.total || 0)}</span>
            </div>
            <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">${d.ventas_hoy.pedidos || 0} pedidos cerrados</p>
            ${libres > 0 ? `<div style="display:flex;gap:8px"><button class="btn btn-primary btn-sm btn-ripple" onclick="app.navigate('mesas')">Ver Mesas</button><button class="btn btn-outline btn-sm" onclick="app.navigate('pos')">Ir al POS</button></div>` : '<p style="color:var(--warning);font-size:13px;font-weight:600">Todas las mesas estan ocupadas</p>'}
          </div>
          <div class="card fade-up fade-up-4">
            <div class="card-header">
              <h3>Top Productos Hoy</h3>
              <span class="badge badge-primary">${d.productos_top.length} items</span>
            </div>
            ${d.productos_top.length === 0 ? '<p style="color:var(--text-muted);font-size:13px">Sin ventas hoy</p>' :
            d.productos_top.map((p, i) => `
              <div class="top-rank">
                <div class="top-rank-number ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other'}">${i + 1}</div>
                <span style="font-size:18px">${this.getEmoji(p.nombre)}</span>
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
        <div class="gradient-header" style="background:linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee)">
          <h1>Mesas</h1>
          <div class="subtitle">${mesas.length} total &middot; <span style="color:#86efac">${libres} libres</span> &middot; <span style="color:#fca5a5">${ocupadas} ocupadas</span>${reservadas > 0 ? ` &middot; <span style="color:#fde68a">${reservadas} reservadas</span>` : ''}</div>
        </div>
        <div class="quick-actions" style="margin-bottom:24px">
          <div class="quick-action-card fade-up fade-up-1" onclick="app.renderMesas()">
            <div class="quick-action-icon" style="background:var(--success-bg)">🔄</div>
            <div class="quick-action-label">Actualizar</div>
          </div>
          <div class="quick-action-card fade-up fade-up-2" onclick="app.navigate('pos')">
            <div class="quick-action-icon" style="background:var(--primary-50)">💳</div>
            <div class="quick-action-label">Ir al POS</div>
          </div>
          ${canEdit ? `
          <div class="quick-action-card fade-up fade-up-3" onclick="app.showModalMesa()">
            <div class="quick-action-icon" style="background:var(--warning-bg)">➕</div>
            <div class="quick-action-label">Nueva Mesa</div>
          </div>` : ''}
        </div>

        <div class="mesas-grid" data-stagger>
          ${mesas.map((m, i) => `
            <div class="mesa-card ${m.estado} fade-up" onclick="app.clickMesa('${m.id}')" style="animation-delay:${i * 0.04}s">
              <div class="mesa-num">Mesa ${m.numero}</div>
              <div class="mesa-cap">${m.capacidad} personas</div>
              ${m.ubicacion ? `<div style="font-size:11px;color:var(--text-muted);margin-top:6px">${m.ubicacion}</div>` : ''}
              <div class="mesa-status-tag">${m.estado === 'libre' ? 'Libre' : m.estado === 'ocupada' ? 'Ocupada' : 'Reservada'}</div>
            </div>`).join('')}
          ${mesas.length === 0 ? '<div class="empty-state" style="grid-column:1/-1"><div class="empty-visual">🪑</div><h4>Sin mesas</h4><p>Crea tu primera mesa para comenzar</p></div>' : ''}
        </div>`;
    } catch (err) { main.innerHTML = `<div class="empty-state"><h4>Error</h4><p>${err.message}</p></div>`; }
  }

  async clickMesa(mesaId) {
    try {
      const mesa = await api.getMesa(mesaId);
      if (mesa.estado === 'ocupada' || mesa.pedido_actual) {
        this.currentPedidoId = mesa.pedido_actual?.id;
        this.currentMesaId = mesaId;
        this.currentMesaCap = mesa.capacidad;
        this.currentPedidoMesaNum = mesa.numero;
        this.navigate('pos');
        if (this.currentPedidoId) this.loadPedidoActual();
      } else {
        const personas = prompt(`Mesa ${mesa.numero} — Capacidad: ${mesa.capacidad}\nCuantas personas van a sentarse?`, mesa.capacidad);
        if (personas === null) return;
        const numPersonas = parseInt(personas);
        if (!numPersonas || numPersonas < 1) { this.toast('Numero de personas invalido', 'error'); return; }
        const pedido = await api.createPedido({ mesa_id: mesaId, personas: numPersonas });
        this.currentPedidoId = pedido.id;
        this.currentMesaId = mesaId;
        this.currentMesaCap = numPersonas;
        this.currentPedidoMesaNum = mesa.numero;
        this.toast(`Pedido creado — Mesa ${mesa.numero} — ${numPersonas} persona(s)`);
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
            <input type="number" id="mesa-cap" value="${editMesa?.capacidad || 4}" min="1" max="50" placeholder="Ej: 4">
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
    if (!await this.showConfirm('¿Eliminar mesa?', 'Esta acción no se puede deshacer.', '🗑️', 'Eliminar', true)) return;
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
      const mesaLabel = this.currentPedidoMesaNum ? `Mesa ${this.currentPedidoMesaNum}${this.currentMesaCap ? ' — ' + this.currentMesaCap + ' personas' : ''}` : '';
      const f = this.getFuncion();
      const canCobrar = f === 'administrador' || f === 'cajero';
      main.innerHTML = `
        <div class="gradient-header" style="background:linear-gradient(135deg, #7c3aed, #6366f1, #818cf8);padding-bottom:16px">
          <h1>Punto de Venta${mesaLabel ? ' - ' + mesaLabel : ''}</h1>
          <div class="subtitle">${this.currentPedidoId ? 'Pedido activo' : 'Selecciona una mesa para tomar el pedido'}</div>
          <div style="display:flex;gap:8px;margin-top:12px;position:relative;z-index:1">
            ${this.currentPedidoId ? `<button class="btn" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.2);border-radius:10px;font-size:12px;padding:8px 14px" onclick="app.cancelarPedidoActual()">✕ Cancelar</button>` : ''}
            <button class="btn" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.2);border-radius:10px;font-size:12px;padding:8px 14px" onclick="app.selectMesaForPos()">🪑 Cambiar Mesa</button>
          </div>
        </div>
        <div style="margin:16px 0">
          <div style="position:relative">
            <input type="text" id="pos-search" placeholder="🔍 Buscar producto..." oninput="app.searchPos(this.value)" style="width:100%;padding:12px 16px 12px 16px;border:1.5px solid var(--border);border-radius:14px;font-size:14px;font-family:inherit;background:var(--bg-card);transition:all 0.2s" onfocus="this.style.borderColor='var(--primary)';this.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)'" onblur="this.style.borderColor='var(--border)';this.style.boxShadow='none'">
          </div>
        </div>
        <div class="pos-layout">
          <div class="pos-menu">
            <div class="pos-categories" id="pos-categories">
              <button class="cat-btn ${!this.posFilterCat ? 'active' : ''}" onclick="app.filterPosCat(null, this)">Todos</button>
              ${categorias.map(c => `<button class="cat-btn ${this.posFilterCat === c.id ? 'active' : ''}" onclick="app.filterPosCat('${c.id}', this)">${c.nombre}</button>`).join('')}
            </div>
            <div class="pos-products" id="pos-products" data-stagger>${this.renderPosProducts(productos)}</div>
          </div>
          <div class="pos-order collapsed-mobile" id="pos-order">
            <div class="pos-order-toggle-mobile" onclick="app.togglePosOrder()">
              <h3>🧾 Pedido <span id="pos-order-count-mobile" style="font-weight:400;color:var(--text-muted);font-size:13px">(0)</span></h3>
              <div style="display:flex;align-items:center;gap:10px">
                <span id="pos-order-total-mobile" class="mono" style="font-size:15px;font-weight:700;color:var(--primary)">${this.formatMoney(0)}</span>
                <span style="font-size:18px;color:var(--text-muted);transition:transform 0.3s" id="pos-order-arrow">▲</span>
              </div>
            </div>
            <div class="pos-order-header">
              <h3>🧾 Pedido Actual</h3>
              <span class="order-status" id="pos-order-status">${this.currentPedidoId ? 'Activo' : 'Sin pedido'}</span>
            </div>
            <div class="pos-order-items" id="pos-order-items">
              <div class="empty-state" style="padding:32px"><div class="empty-visual" style="width:64px;height:64px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 12px">🛒</div><h4 style="font-size:15px">Sin productos</h4><p style="font-size:13px;color:var(--text-muted)">Selecciona productos del menu</p></div>
            </div>
            <div class="pos-order-footer">
              <div class="order-line"><span>Subtotal</span><span id="pos-subtotal">${this.formatMoney(0)}</span></div>
              <div class="order-line"><span>IVA (16%)</span><span id="pos-iva">${this.formatMoney(0)}</span></div>
              <div class="order-line grand-total"><span>Total</span><span id="pos-total">${this.formatMoney(0)}</span></div>
              ${canCobrar ? `
              <button class="btn btn-success btn-block btn-lg btn-ripple" style="margin-top:16px;border-radius:14px;min-height:52px;font-size:16px" id="pos-cobrar-btn" onclick="app.cobrarPedido()" ${!this.currentPedidoId ? 'disabled' : ''}>
                💳 Cobrar Pedido
              </button>` : `
              <div style="text-align:center;color:var(--text-muted);font-size:12px;margin-top:12px;padding:16px;background:var(--primary-50);border-radius:14px;border:1.5px dashed var(--primary-light)">
                <div style="font-size:24px;margin-bottom:6px">🍽</div>
                <div style="font-weight:600;color:var(--primary);font-size:13px">Modo Atencion</div>
                <div style="margin-top:4px;font-size:12px">Solo toma de pedidos. El cajero realiza el cobro.</div>
              </div>`}
            </div>
          </div>
        </div>`;
      if (this.currentPedidoId) this.loadPedidoActual();
    } catch (err) { main.innerHTML = `<div class="empty-state"><h4>Error</h4><p>${err.message}</p></div>`; }
  }

  searchPos(query) {
    const q = query.toLowerCase().trim();
    const filtered = q ? window._posProductos.filter(p => p.nombre.toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q)) : window._posProductos;
    document.getElementById('pos-products').innerHTML = this.renderPosProducts(filtered);
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
      const countEl = document.getElementById('pos-order-count-mobile');
      const totalMobileEl = document.getElementById('pos-order-total-mobile');
      if (countEl) countEl.textContent = `(${pedido.detalles?.length || 0})`;
      if (totalMobileEl) totalMobileEl.textContent = this.formatMoney(pedido.total);
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

  togglePosOrder() {
    const order = document.getElementById('pos-order');
    const arrow = document.getElementById('pos-order-arrow');
    if (!order) return;
    order.classList.toggle('collapsed-mobile');
    if (arrow) arrow.style.transform = order.classList.contains('collapsed-mobile') ? 'rotate(0deg)' : 'rotate(180deg)';
  }

  async removeItem(itemId) {
    try { await api.removeItemPedido(this.currentPedidoId, itemId); this.loadPedidoActual(); }
    catch (err) { this.toast(err.message, 'error'); }
  }

  async cobrarPedido() {
    if (!this.currentPedidoId) return;
    try {
      const pedido = await api.getPedido(this.currentPedidoId);
      const total = pedido.total || 0;
      const mesaNum = this.currentPedidoMesaNum;

      const metodos = [
        { id: 'efectivo', icon: '💵', label: 'Efectivo', color: '#10b981' },
        { id: 'tarjeta', icon: '💳', label: 'Tarjeta', color: '#6366f1' },
        { id: 'yape', icon: '📱', label: 'Yape', color: '#7c3aed' },
        { id: 'plin', icon: '📲', label: 'Plin', color: '#0ea5e9' },
        { id: 'transferencia', icon: '🏦', label: 'Transferencia', color: '#f59e0b' },
      ];

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
      overlay.innerHTML = `
        <div class="modal" style="max-width:400px">
          <div class="modal-header">
            <h2>Cobrar Pedido</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
          </div>
          <div class="modal-body" style="text-align:center;padding-top:8px">
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:4px">Mesa ${mesaNum || '-'}</div>
            <div style="font-size:28px;font-weight:800;color:var(--text);margin-bottom:20px">${this.formatMoney(total)}</div>
            <div style="font-size:13px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;text-align:left">Metodo de pago</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px" id="pago-metodos">
              ${metodos.map(m => `
                <div class="pago-metodo-card" onclick="app.selectPagoMetodo('${m.id}', this)" data-metodo="${m.id}" style="border:2px solid var(--border-light);border-radius:14px;padding:16px 10px;cursor:pointer;transition:all 0.25s;display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--bg-card)">
                  <span style="font-size:28px">${m.icon}</span>
                  <span style="font-size:13px;font-weight:600;color:var(--text)">${m.label}</span>
                </div>`).join('')}
            </div>
            <div id="pago-extras" style="margin-top:14px;display:none">
              <div class="form-group" style="margin-bottom:10px;text-align:left">
                <label style="font-size:12px;font-weight:600;color:var(--text-secondary)">Monto recibido</label>
                <input type="number" id="pago-monto-recibido" placeholder="0.00" step="0.01" oninput="app.calcCambio()" style="width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:12px;font-size:16px;font-weight:700;font-family:inherit;text-align:center">
              </div>
              <div id="pago-cambio" style="font-size:14px;font-weight:600;color:var(--text-muted);padding:8px 0"></div>
            </div>
            <div id="pago-referencia" style="margin-top:14px;display:none">
              <div class="form-group" style="text-align:left">
                <label style="font-size:12px;font-weight:600;color:var(--text-secondary)">Codigo / Referencia</label>
                <input type="text" id="pago-ref-code" placeholder="Ej: 123456" style="width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:12px;font-size:14px;font-family:inherit">
              </div>
            </div>
          </div>
          <div class="modal-footer" style="justify-content:stretch;padding:0 20px 20px">
            <div style="display:flex;gap:8px;width:100%">
              <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()" style="flex:0 0 auto;border-radius:12px">Cancelar</button>
              <button class="btn btn-success btn-ripple" id="pago-confirm-btn" onclick="app.confirmPago()" style="flex:1;border-radius:12px;min-height:48px;font-size:15px" disabled>Confirmar Pago</button>
            </div>
          </div>
        </div>`;

      document.body.appendChild(overlay);
      this._pagoMetodo = null;
      this._pagoMesaNum = mesaNum;
      this._pagoPedido = pedido;
    } catch (err) { this.toast(err.message, 'error'); }
  }

  selectPagoMetodo(metodo, el) {
    this._pagoMetodo = metodo;
    document.querySelectorAll('.pago-metodo-card').forEach(c => { c.style.borderColor = 'var(--border-light)'; c.style.background = 'var(--bg-card)'; });
    el.style.borderColor = 'var(--primary)';
    el.style.background = 'var(--primary-50)';

    const extras = document.getElementById('pago-extras');
    const refDiv = document.getElementById('pago-referencia');
    const btn = document.getElementById('pago-confirm-btn');
    btn.disabled = false;

    if (metodo === 'efectivo') {
      extras.style.display = 'block';
      refDiv.style.display = 'none';
      document.getElementById('pago-monto-recibido').value = '';
      document.getElementById('pago-monto-recibido').focus();
      document.getElementById('pago-cambio').textContent = '';
    } else {
      extras.style.display = 'none';
      refDiv.style.display = 'block';
    }
  }

  calcCambio() {
    const total = this._pagoPedido?.total || 0;
    const recibido = parseFloat(document.getElementById('pago-monto-recibido').value) || 0;
    const cambio = recibido - total;
    const el = document.getElementById('pago-cambio');
    if (recibido > 0) {
      el.textContent = cambio >= 0 ? `Cambio: ${this.formatMoney(cambio)}` : `Falta: ${this.formatMoney(Math.abs(cambio))}`;
      el.style.color = cambio >= 0 ? 'var(--success)' : 'var(--danger)';
    } else {
      el.textContent = '';
    }
  }

  async confirmPago() {
    if (!this._pagoMetodo || !this.currentPedidoId) return;
    const btn = document.getElementById('pago-confirm-btn');
    btn.disabled = true;
    btn.textContent = 'Procesando...';
    try {
      await api.cerrarPedido(this.currentPedidoId, this._pagoMetodo);
      const pedidoCompleto = await api.getPedido(this.currentPedidoId);
      this.toast('Pago registrado exitosamente');
      const mesaNum = this._pagoMesaNum;
      const metodo = this._pagoMetodo;
      this.currentPedidoId = null; this.currentMesaId = null; this.currentPedidoMesaNum = null; this.currentMesaCap = null;
      document.querySelector('.modal-overlay')?.remove();
      this.showReceiptModal({ ...pedidoCompleto, mesa_numero: mesaNum, metodo_pago: metodo });
    } catch (err) {
      this.toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Confirmar Pago';
    }
  }

  async cancelarPedidoActual() {
    if (!this.currentPedidoId) return;
    if (!await this.showConfirm('¿Cancelar pedido?', 'El pedido se marcará como cancelado.', '⚠️', 'Cancelar', true)) return;
    try {
      await api.cancelarPedido(this.currentPedidoId);
      this.toast('Pedido cancelado');
      this.currentPedidoId = null; this.currentMesaId = null; this.currentPedidoMesaNum = null; this.currentMesaCap = null;
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
    const metodoLabels = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', yape: 'Yape', plin: 'Plin', transferencia: 'Transferencia' };
    const metodoPago = metodoLabels[r.metodo_pago || r.pedido?.metodo_pago] || 'Efectivo';

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
          <div>Pago: ${metodoPago}</div>
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

    const boletaHtml = this.buildBoletaHtml({ empresa, fechaStr, horaStr, mesaNum, pedido, detalles, usuario: this.user.nombre, metodo_pago: pedido.metodo_pago });

    const metodoLabels = { efectivo: '💵 Efectivo', tarjeta: '💳 Tarjeta', yape: '📱 Yape', plin: '📲 Plin', transferencia: '🏦 Transferencia' };
    const metodoLabel = metodoLabels[pedido.metodo_pago] || pedido.metodo_pago || 'Efectivo';

    overlay.innerHTML = `
      <div class="modal" style="max-width:480px">
        <div class="modal-body" style="padding:0;text-align:center">
          <div style="padding:32px 24px 24px;background:linear-gradient(135deg,#059669,#10b981);border-radius:24px 24px 0 0;position:relative;overflow:hidden">
            <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;background:rgba(255,255,255,0.1);border-radius:50%"></div>
            <div style="position:absolute;bottom:-30px;left:-30px;width:80px;height:80px;background:rgba(255,255,255,0.08);border-radius:50%"></div>
            <div class="receipt-success-ring" style="position:relative;z-index:1">
              <span style="font-size:28px;color:white">✓</span>
            </div>
            <div style="font-size:20px;font-weight:800;color:white;margin-top:12px;position:relative;z-index:1">Cobro Exitoso</div>
            <div style="font-size:32px;font-weight:800;color:white;margin-top:4px;font-family:'SF Mono',monospace;position:relative;z-index:1">${this.formatMoney(pedido.total)}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:6px;position:relative;z-index:1;background:rgba(255,255,255,0.15);display:inline-block;padding:4px 12px;border-radius:20px">${metodoLabel}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:6px;position:relative;z-index:1">Mesa ${mesaNum} &middot; ${fechaStr} &middot; ${horaStr}</div>
          </div>

          <div style="padding:20px 24px">
            <div class="form-group" style="margin-bottom:16px">
              <label style="font-size:12px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">Enviar por WhatsApp</label>
              <div style="display:flex;gap:8px">
                <input type="tel" id="receipt-phone" placeholder="999888777" style="flex:1;padding:12px 14px;border:1.5px solid var(--border);border-radius:12px;font-size:14px;font-family:inherit;transition:all 0.2s" onfocus="this.style.borderColor='var(--success)';this.style.boxShadow='0 0 0 3px rgba(16,185,129,0.1)'" onblur="this.style.borderColor='var(--border)';this.style.boxShadow='none'">
                <button class="btn btn-success btn-ripple" onclick="app.shareReceiptWhatsApp()" style="border-radius:12px;padding:12px 18px">📱 Enviar</button>
              </div>
            </div>

            <div style="display:flex;gap:8px;margin-bottom:16px">
              <button class="btn btn-outline" onclick="document.getElementById('boleta-preview-wrap').classList.toggle('hidden')" style="flex:1;border-radius:12px;min-height:44px">
                👁 Ver Boleta
              </button>
              <button class="btn btn-primary btn-ripple" onclick="app.downloadBoletaPdf()" style="flex:1;border-radius:12px;min-height:44px">
                📄 Descargar PDF
              </button>
            </div>

            <div id="boleta-preview-wrap" class="hidden" style="overflow-x:auto;display:flex;justify-content:center;margin-bottom:16px;border-radius:12px;border:1px solid var(--border-light)">
              ${boletaHtml}
            </div>

            <button class="btn btn-ghost btn-block" onclick="app.closeReceiptAndRender()" style="border-radius:12px;min-height:44px;color:var(--text-muted)">
              Cerrar
            </button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    this.spawnConfetti();

    this._lastReceipt = {
      empresa, fechaStr, horaStr, mesaNum,
      pedido,
      detalles,
      total: this.formatMoney(pedido.total),
      usuario: this.user.nombre,
      metodo_pago: pedido.metodo_pago,
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
        <div class="gradient-header">
          <h1>Pedidos Abiertos</h1>
          <div class="subtitle">${pedidos.length} pedido(s) en curso</div>
        </div>
        <div class="quick-actions">
          <div class="quick-action-card fade-up fade-up-1" onclick="app.renderPedidosCajero()">
            <div class="quick-action-icon" style="background:var(--success-bg)">🔄</div>
            <div class="quick-action-label">Actualizar</div>
          </div>
          <div class="quick-action-card fade-up fade-up-2" onclick="app.navigate('pos')">
            <div class="quick-action-icon" style="background:var(--primary-50)">💳</div>
            <div class="quick-action-label">Ir al POS</div>
          </div>
          <div class="quick-action-card fade-up fade-up-3" onclick="app.navigate('historial')">
            <div class="quick-action-icon" style="background:var(--info-bg)">📜</div>
            <div class="quick-action-label">Historial</div>
          </div>
          <div class="quick-action-card fade-up fade-up-4" onclick="app.navigate('caja')">
            <div class="quick-action-icon" style="background:var(--warning-bg)">💰</div>
            <div class="quick-action-label">Caja</div>
          </div>
        </div>
        ${pedidos.length === 0 ? `
          <div class="empty-state-pedidos">
            <div class="empty-visual">📋</div>
            <h3>Sin pedidos abiertos</h3>
            <p>Cuando los meseros creen pedidos, apareceran aqui en tiempo real.</p>
          </div>
        ` : `
          <div class="pedidos-grid" data-stagger>
            ${pedidos.map((p, i) => `
              <div class="pedido-card fade-up" style="animation-delay:${i * 0.06}s">
                <div class="pedido-card-top">
                  <div class="pedido-card-id">#${p.id.substring(0,8).toUpperCase()}</div>
                  ${p.mesa_numero ? `
                    <div class="pedido-card-mesa">
                      <span class="mesa-dot"></span>
                      Mesa ${p.mesa_numero}
                    </div>` : ''}
                </div>
                <div class="pedido-card-body">
                  <div class="pedido-card-mesero">
                    <div class="pedido-card-mesero-avatar">${(p.usuario_nombre || 'U').substring(0,2).toUpperCase()}</div>
                    <div class="pedido-card-mesero-name">${p.usuario_nombre || 'Sin asignar'}</div>
                  </div>
                </div>
                <div class="pedido-card-total">
                  <div class="pedido-card-total-label">Total</div>
                  <div class="pedido-card-total-amount">${this.formatMoney(p.total)}</div>
                </div>
                <div class="pedido-card-footer">
                  <button class="btn btn-success btn-ripple" onclick="app.cobrarPedidoDirecto('${p.id}')">
                    💳 Cobrar
                  </button>
                  <button class="btn btn-outline" onclick="app.verPedidoDetalle('${p.id}')">
                    👁 Ver
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}`;
    } catch (err) { main.innerHTML = `<div class="empty-state"><h4>Error</h4><p>${err.message}</p></div>`; }
  }

  async verPedidoDetalle(pedidoId) {
    try {
      const pedido = await api.getPedido(pedidoId);
      const items = pedido.detalles || [];
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
      overlay.innerHTML = `
        <div class="modal" style="max-width:440px">
          <div class="modal-header">
            <h2>Pedido #${pedidoId.substring(0,8).toUpperCase()}</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
          </div>
          <div class="modal-body">
            <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
              <div class="badge badge-warning" style="font-size:12px">Abierto</div>
              ${pedido.mesa_numero ? `<span style="font-size:13px;color:var(--text-secondary)">Mesa ${pedido.mesa_numero}</span>` : ''}
              ${pedido.usuario_nombre ? `<span style="font-size:13px;color:var(--text-secondary)">👤 ${pedido.usuario_nombre}</span>` : ''}
            </div>
            <div style="border-top:1px solid var(--border-light);padding-top:12px">
              ${items.length === 0 ? '<p style="text-align:center;color:var(--text-muted);padding:20px">Sin items</p>' :
              items.map(d => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-light)">
                  <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-size:18px">${this.getEmoji(d.producto_nombre)}</span>
                    <div>
                      <div style="font-size:13px;font-weight:600">${d.producto_nombre}</div>
                      <div style="font-size:11px;color:var(--text-muted)">${d.cantidad} x ${this.formatMoney(d.precio_unitario)}</div>
                    </div>
                  </div>
                  <span style="font-size:14px;font-weight:700;color:var(--primary)">${this.formatMoney(d.subtotal)}</span>
                </div>
              `).join('')}
            </div>
            <div style="display:flex;justify-content:space-between;padding-top:14px;margin-top:8px;border-top:2px solid var(--text)">
              <span style="font-weight:700;font-size:15px">TOTAL</span>
              <span style="font-weight:800;font-size:18px;color:var(--primary)">${this.formatMoney(pedido.total)}</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cerrar</button>
            <button class="btn btn-success" onclick="this.closest('.modal-overlay').remove(); app.cobrarPedidoDirecto('${pedidoId}')">💳 Cobrar</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
    } catch (err) { this.toast(err.message, 'error'); }
  }

  async cobrarPedidoDirecto(pedidoId) {
    try {
      const pedido = await api.getPedido(pedidoId);
      const total = pedido.total || 0;
      const mesaNum = pedido.mesa_numero;

      const metodos = [
        { id: 'efectivo', icon: '💵', label: 'Efectivo', color: '#10b981' },
        { id: 'tarjeta', icon: '💳', label: 'Tarjeta', color: '#6366f1' },
        { id: 'yape', icon: '📱', label: 'Yape', color: '#7c3aed' },
        { id: 'plin', icon: '📲', label: 'Plin', color: '#0ea5e9' },
        { id: 'transferencia', icon: '🏦', label: 'Transferencia', color: '#f59e0b' },
      ];

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
      overlay.innerHTML = `
        <div class="modal" style="max-width:400px">
          <div class="modal-header">
            <h2>Cobrar Pedido</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
          </div>
          <div class="modal-body" style="text-align:center;padding-top:8px">
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:4px">Mesa ${mesaNum || '-'}</div>
            <div style="font-size:28px;font-weight:800;color:var(--text);margin-bottom:20px">${this.formatMoney(total)}</div>
            <div style="font-size:13px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;text-align:left">Metodo de pago</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px" id="pago-metodos">
              ${metodos.map(m => `
                <div class="pago-metodo-card" onclick="app.selectPagoMetodoDirecto('${m.id}', this, '${pedidoId}')" data-metodo="${m.id}" style="border:2px solid var(--border-light);border-radius:14px;padding:16px 10px;cursor:pointer;transition:all 0.25s;display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--bg-card)">
                  <span style="font-size:28px">${m.icon}</span>
                  <span style="font-size:13px;font-weight:600;color:var(--text)">${m.label}</span>
                </div>`).join('')}
            </div>
            <div id="pago-extras" style="margin-top:14px;display:none">
              <div class="form-group" style="margin-bottom:10px;text-align:left">
                <label style="font-size:12px;font-weight:600;color:var(--text-secondary)">Monto recibido</label>
                <input type="number" id="pago-monto-recibido" placeholder="0.00" step="0.01" oninput="app.calcCambio()" style="width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:12px;font-size:16px;font-weight:700;font-family:inherit;text-align:center">
              </div>
              <div id="pago-cambio" style="font-size:14px;font-weight:600;color:var(--text-muted);padding:8px 0"></div>
            </div>
            <div id="pago-referencia" style="margin-top:14px;display:none">
              <div class="form-group" style="text-align:left">
                <label style="font-size:12px;font-weight:600;color:var(--text-secondary)">Codigo / Referencia</label>
                <input type="text" id="pago-ref-code" placeholder="Ej: 123456" style="width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:12px;font-size:14px;font-family:inherit">
              </div>
            </div>
          </div>
          <div class="modal-footer" style="justify-content:stretch;padding:0 20px 20px">
            <div style="display:flex;gap:8px;width:100%">
              <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()" style="flex:0 0 auto;border-radius:12px">Cancelar</button>
              <button class="btn btn-success btn-ripple" id="pago-confirm-btn" onclick="app.confirmPagoDirecto('${pedidoId}')" style="flex:1;border-radius:12px;min-height:48px;font-size:15px" disabled>Confirmar Pago</button>
            </div>
          </div>
        </div>`;

      document.body.appendChild(overlay);
      this._pagoMetodo = null;
      this._pagoPedido = pedido;
    } catch (err) { this.toast(err.message, 'error'); }
  }

  selectPagoMetodoDirecto(metodo, el, pedidoId) {
    this._pagoMetodo = metodo;
    this._pagoPedidoId = pedidoId;
    document.querySelectorAll('.pago-metodo-card').forEach(c => { c.style.borderColor = 'var(--border-light)'; c.style.background = 'var(--bg-card)'; });
    el.style.borderColor = 'var(--primary)';
    el.style.background = 'var(--primary-50)';

    const extras = document.getElementById('pago-extras');
    const refDiv = document.getElementById('pago-referencia');
    const btn = document.getElementById('pago-confirm-btn');
    btn.disabled = false;

    if (metodo === 'efectivo') {
      extras.style.display = 'block';
      refDiv.style.display = 'none';
      document.getElementById('pago-monto-recibido').value = '';
      document.getElementById('pago-monto-recibido').focus();
      document.getElementById('pago-cambio').textContent = '';
    } else {
      extras.style.display = 'none';
      refDiv.style.display = 'block';
    }
  }

  async confirmPagoDirecto(pedidoId) {
    if (!this._pagoMetodo) return;
    const btn = document.getElementById('pago-confirm-btn');
    btn.disabled = true;
    btn.textContent = 'Procesando...';
    try {
      await api.cerrarPedido(pedidoId, this._pagoMetodo);
      const pedidoCompleto = await api.getPedido(pedidoId);
      this.toast('Pago registrado exitosamente');
      document.querySelector('.modal-overlay')?.remove();
      this.showReceiptModal({ ...pedidoCompleto, metodo_pago: this._pagoMetodo });
    } catch (err) {
      this.toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Confirmar Pago';
    }
  }

  /* ==================== MENU ==================== */
  async renderMenu() {
    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="empty-state"><div class="spinner" style="border-color:var(--primary);border-top-color:transparent;width:32px;height:32px"></div></div>';
    try {
      const [cats, prods] = await Promise.all([api.getCategorias(), api.getProductos()]);
      main.innerHTML = `
        <div class="gradient-header" style="background:linear-gradient(135deg, #ea580c, #f97316, #fb923c)">
          <h1>Menu</h1>
          <div class="subtitle">${prods.length} productos &middot; ${cats.length} categorias</div>
        </div>
        <div class="tabs" id="menu-tabs">
          <button class="tab active" onclick="app.showMenuTab('productos', this)">Productos</button>
          <button class="tab" onclick="app.showMenuTab('categorias', this)">Categorias</button>
        </div>
        <div id="menu-tab-productos">
          <div style="margin-bottom:16px"><button class="btn btn-primary btn-ripple" onclick="app.showModalProducto()" style="border-radius:12px">+ Nuevo Producto</button></div>
          <div class="menu-product-list">
            ${prods.length === 0 ? '<div class="empty-state" style="padding:48px"><div class="empty-visual" style="width:64px;height:64px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 12px">📦</div><h4>Sin productos</h4><p>Agrega tu primer producto</p></div>' :
            prods.map((p, i) => `
              <div class="menu-product-card fade-up" style="animation-delay:${i * 0.03}s">
                <div class="menu-product-info">
                  <span style="font-size:28px">${this.getEmoji(p.nombre)}</span>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:14px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.nombre}</div>
                    <div style="font-size:12px;color:var(--text-muted)">${p.categoria_nombre || 'Sin categoria'}</div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:16px;font-weight:800;color:var(--primary)">${this.formatMoney(p.precio)}</div>
                    <div style="font-size:11px;margin-top:2px">${p.stock >= 0 ? `<span class="badge badge-warning" style="font-size:9px">Stock: ${p.stock}</span>` : '<span class="badge badge-info" style="font-size:9px">Ilimitado</span>'} <span class="badge badge-${p.disponible ? 'success' : 'danger'}" style="font-size:9px">${p.disponible ? 'OK' : 'No'}</span></div>
                  </div>
                </div>
                <div class="menu-product-actions">
                  <button class="btn btn-outline btn-sm btn-ripple" onclick='app.showModalProducto(${JSON.stringify(p).replace(/'/g, "&#39;")})' style="flex:1;border-radius:10px">Editar</button>
                </div>
              </div>`).join('')}
          </div>
        </div>
        <div id="menu-tab-categorias" class="hidden">
          <div style="margin-bottom:16px"><button class="btn btn-primary btn-ripple" onclick="app.showModalCategoria()" style="border-radius:12px">+ Nueva Categoria</button></div>
          <div class="menu-cat-list">
            ${cats.length === 0 ? '<div class="empty-state" style="padding:48px"><div class="empty-visual" style="width:64px;height:64px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 12px">📂</div><h4>Sin categorias</h4><p>Crea tu primera categoria</p></div>' :
            cats.map((c, i) => `
              <div class="menu-cat-card fade-up" style="animation-delay:${i * 0.03}s">
                <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">
                  <div style="width:40px;height:40px;border-radius:12px;background:var(--primary-50);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:var(--primary);flex-shrink:0">${c.orden || '-'}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:14px;font-weight:700;color:var(--text)">${c.nombre}</div>
                    <div style="font-size:12px;color:var(--text-muted)">Orden: ${c.orden || 0}</div>
                  </div>
                </div>
                <div class="menu-cat-actions">
                  <button class="btn btn-outline btn-sm" onclick="app.showModalCategoria(${JSON.stringify(c).replace(/'/g, "&#39;")})">Editar</button>
                  <button class="btn btn-outline btn-sm" style="color:var(--danger);border-color:var(--danger)" onclick="app.deleteCategoria('${c.id}')">Eliminar</button>
                </div>
              </div>`).join('')}
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
    if (!await this.showConfirm('¿Eliminar producto?', 'Esta acción no se puede deshacer.', '🗑️', 'Eliminar', true)) return;
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
    if (!await this.showConfirm('¿Eliminar categoría?', 'Esta acción no se puede deshacer.', '🗑️', 'Eliminar', true)) return;
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
      const [ventas, top, dashboard, metodosPago] = await Promise.all([
        api.getReporteVentas(`fecha_inicio=${mes}-01&fecha_fin=${hoy}`),
        api.getTopProductos(`fecha_inicio=${mes}-01&fecha_fin=${hoy}&limite=10`),
        api.getDashboard(),
        api.getMetodosPago(`fecha_inicio=${mes}-01&fecha_fin=${hoy}`)
      ]);
      const maxIngreso = top.length > 0 ? Math.max(...top.map(p => p.total_ingreso)) : 1;
      main.innerHTML = `
        <div class="gradient-header" style="background:linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)">
          <h1>Reportes</h1>
          <div class="subtitle">Ventas y rendimiento del mes</div>
        </div>

        <div class="stats-grid">
          <div class="stat-card fade-up fade-up-1">
            <div class="stat-bg-icon">💰</div>
            <div class="stat-top"><div class="stat-icon-wrap success">💰</div><div class="stat-label">Ventas del Mes</div></div>
            <div class="stat-value">${this.formatMoney(dashboard.ventas_mes.total || 0)}</div>
          </div>
          <div class="stat-card fade-up fade-up-2">
            <div class="stat-bg-icon">📦</div>
            <div class="stat-top"><div class="stat-icon-wrap primary">📦</div><div class="stat-label">Pedidos del Mes</div></div>
            <div class="stat-value">${dashboard.ventas_mes.pedidos || 0}</div>
          </div>
          <div class="stat-card fade-up fade-up-3">
            <div class="stat-bg-icon">📅</div>
            <div class="stat-top"><div class="stat-icon-wrap info">📅</div><div class="stat-label">Ventas Hoy</div></div>
            <div class="stat-value">${this.formatMoney(dashboard.ventas_hoy.total || 0)}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card fade-up fade-up-4">
            <div class="card-header"><h3>Top Productos</h3><span class="badge badge-primary">Top ${top.length}</span></div>
            ${top.length === 0 ? '<p style="text-align:center;color:var(--text-muted);padding:24px">Sin datos</p>' :
            top.map((p, i) => `
              <div class="report-bar-container">
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="top-rank-number ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other'}">${i + 1}</div>
                  <span style="font-size:16px">${this.getEmoji(p.nombre)}</span>
                  <div style="flex:1">
                    <div style="font-size:13px;font-weight:600">${p.nombre}</div>
                    <div style="font-size:11px;color:var(--text-muted)">${p.total_vendido} vendidos &middot; ${this.formatMoney(p.total_ingreso)}</div>
                  </div>
                </div>
                <div class="report-bar">
                  <div class="report-bar-fill" style="width:${Math.round((p.total_ingreso / maxIngreso) * 100)}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="card fade-up fade-up-5">
            <div class="card-header"><h3>Ventas por Dia</h3><span class="badge badge-info">${ventas.length} dias</span></div>
            ${ventas.length === 0 ? '<p style="text-align:center;color:var(--text-muted);padding:24px">Sin datos</p>' :
            ventas.slice(0, 12).map(v => `
              <div class="report-bar-container">
                <div style="display:flex;align-items:center;justify-content:space-between">
                  <span style="font-size:13px;font-weight:500">${v.fecha}</span>
                  <div style="display:flex;align-items:center;gap:8px">
                    <span class="badge badge-primary" style="font-size:10px">${v.total_pedidos} pedidos</span>
                    <span style="font-size:14px;font-weight:700;color:var(--success)">${this.formatMoney(v.total)}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card fade-up fade-up-6" style="margin-top:16px">
          <div class="card-header"><h3>Metodos de Pago</h3><span class="badge badge-success">${metodosPago.length} metodos</span></div>
          ${metodosPago.length === 0 ? '<p style="text-align:center;color:var(--text-muted);padding:24px">Sin datos</p>' :
          `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;padding:4px 0">
            ${metodosPago.map(m => {
              const icons = { efectivo: '💵', tarjeta: '💳', yape: '📱', plin: '📲', transferencia: '🏦' };
              const colors = { efectivo: 'var(--success)', tarjeta: '#6366f1', yape: '#7c3aed', plin: '#0ea5e9', transferencia: 'var(--warning)' };
              return `
              <div style="text-align:center;padding:16px 10px;border-radius:14px;border:1.5px solid var(--border-light);background:var(--bg-card)">
                <div style="font-size:28px;margin-bottom:6px">${icons[m.metodo_pago] || '💵'}</div>
                <div style="font-size:12px;font-weight:600;color:var(--text-secondary);text-transform:uppercase">${m.metodo_pago || 'efectivo'}</div>
                <div style="font-size:18px;font-weight:800;color:${colors[m.metodo_pago] || 'var(--success)'};margin-top:4px">${this.formatMoney(m.total_monto)}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${m.total_pedidos} pedido(s)</div>
              </div>`;
            }).join('')}
          </div>`}
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
        <div class="gradient-header" style="background:linear-gradient(135deg, #059669, #10b981, #34d399)">
          <h1>Cuadre de Caja</h1>
          <div class="subtitle">${hoy}</div>
        </div>

        <div style="text-align:center;margin-bottom:24px" class="fade-up">
          <div class="caja-status-ring ${estado}">
            ${estado === 'abierta' ? '🔓' : estado === 'cerrada' ? '🔒' : '🏪'}
          </div>
          <div style="font-size:18px;font-weight:700;color:${estado === 'abierta' ? 'var(--success)' : 'var(--danger)'}">
            Caja ${estado === 'abierta' ? 'Abierta' : estado === 'cerrada' ? 'Cerrada' : 'Sin Abrir'}
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card fade-up fade-up-1">
            <div class="stat-bg-icon">💵</div>
            <div class="stat-top">
              <div class="stat-icon-wrap primary">💵</div>
              <div class="stat-label">Fondo</div>
            </div>
            <div class="stat-value">${this.formatMoney(caja.caja.monto_inicial || 0)}</div>
          </div>
          <div class="stat-card fade-up fade-up-2">
            <div class="stat-bg-icon">📈</div>
            <div class="stat-top">
              <div class="stat-icon-wrap success">📈</div>
              <div class="stat-label">Ventas</div>
            </div>
            <div class="stat-value">${this.formatMoney(caja.total_ventas || 0)}</div>
            <div class="stat-change up">${caja.total_pedidos || 0} pedidos</div>
          </div>
          <div class="stat-card fade-up fade-up-3">
            <div class="stat-bg-icon">💰</div>
            <div class="stat-top">
              <div class="stat-icon-wrap warning">💰</div>
              <div class="stat-label">Efectivo</div>
            </div>
            <div class="stat-value">${this.formatMoney(efectivo)}</div>
          </div>
        </div>

        <div class="caja-flow fade-up fade-up-4">
          <div class="caja-flow-item">
            <div class="flow-value" style="color:var(--primary)">${this.formatMoney(caja.caja.monto_inicial || 0)}</div>
            <div class="flow-label">Fondo</div>
          </div>
          <div class="caja-flow-arrow">+</div>
          <div class="caja-flow-item">
            <div class="flow-value" style="color:var(--success)">${this.formatMoney(caja.total_ventas || 0)}</div>
            <div class="flow-label">Ventas</div>
          </div>
          <div class="caja-flow-arrow">=</div>
          <div class="caja-flow-item">
            <div class="flow-value" style="color:var(--warning)">${this.formatMoney(efectivo)}</div>
            <div class="flow-label">Efectivo</div>
          </div>
        </div>

        <div class="card fade-up fade-up-5" style="text-align:center">
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:12px">Impuestos del dia: <strong>${this.formatMoney(caja.total_impuestos || 0)}</strong></div>
          ${estado === 'sin_abrir' || estado === 'cerrada' ? `
            <div class="form-group" style="max-width:300px;margin:0 auto 16px"><label>Monto Inicial (S/)</label><input type="number" step="0.01" id="caja-inicial" value="0"></div>
            <button class="btn btn-success btn-lg btn-ripple" onclick="app.abrirCaja()" style="min-width:200px">🔓 Abrir Caja</button>
          ` : `
            <button class="btn btn-danger btn-lg btn-ripple" onclick="app.cerrarCaja()" style="min-width:200px">🔒 Cerrar Caja del Dia</button>
          `}
        </div>`;
    } catch (err) { main.innerHTML = `<div class="empty-state"><h4>Error</h4><p>${err.message}</p></div>`; }
  }

  async abrirCaja() {
    try { await api.abrirCaja({ monto_inicial: parseFloat(document.getElementById('caja-inicial').value) || 0 }); this.toast('Caja abierta'); this.renderCaja(); }
    catch (err) { this.toast(err.message, 'error'); }
  }

  async cerrarCaja() {
    if (!await this.showConfirm('¿Cerrar la caja?', 'Se generará el cuadre del día.', '🔒', 'Cerrar Caja', true)) return;
    try { await api.cerrarCaja(); this.toast('Caja cerrada'); this.renderCaja(); }
    catch (err) { this.toast(err.message, 'error'); }
  }

  /* ==================== USUARIOS ==================== */
  async renderUsuarios() {
    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="empty-state"><div class="spinner" style="border-color:var(--primary);border-top-color:transparent;width:32px;height:32px"></div></div>';
    try {
      const usuarios = await api.getUsuarios();
      const adminCount = usuarios.filter(u => u.funcion === 'administrador').length;
      const cajeroCount = usuarios.filter(u => u.funcion === 'cajero').length;
      const mosoCount = usuarios.filter(u => u.funcion === 'moso').length;
      main.innerHTML = `
        <div class="gradient-header" style="background:linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee)">
          <h1>Usuarios</h1>
          <div class="subtitle">${usuarios.length} usuario(s) &middot; ${adminCount} admins &middot; ${cajeroCount} cajeros &middot; ${mosoCount} meseros</div>
        </div>
        <div style="margin-bottom:20px">
          <button class="btn btn-primary btn-ripple" onclick="app.showModalUsuario()" style="border-radius:12px">+ Nuevo Usuario</button>
        </div>
        <div class="usuarios-grid">
          ${usuarios.length === 0 ? '<div class="empty-state-pedidos"><div class="empty-visual">👥</div><h3>Sin usuarios</h3><p>Crea el primer usuario del equipo.</p></div>' :
          usuarios.map((u, i) => {
            const gradients = ['linear-gradient(135deg,#6366f1,#8b5cf6)', 'linear-gradient(135deg,#f43f5e,#e11d48)', 'linear-gradient(135deg,#06b6d4,#0891b2)', 'linear-gradient(135deg,#10b981,#059669)', 'linear-gradient(135deg,#f59e0b,#d97706)'];
            const grad = gradients[i % gradients.length];
            return `
            <div class="usuario-card fade-up" style="animation-delay:${i * 0.05}s">
              <div class="usuario-avatar" style="background:${grad};color:white;font-size:14px">${(u.nombre || 'U').substring(0,2).toUpperCase()}</div>
              <div class="usuario-info">
                <div class="usuario-name">${u.nombre}</div>
                <div class="usuario-email">${u.email}</div>
                <div class="usuario-badges">
                  <span class="badge badge-${u.funcion === 'administrador' ? 'primary' : u.funcion === 'cajero' ? 'warning' : 'info'}">${u.funcion}</span>
                  <span class="badge badge-${u.activo ? 'success' : 'danger'}">${u.activo ? 'Activo' : 'Inactivo'}</span>
                </div>
              </div>
              <div class="usuario-actions">
                <button class="btn btn-sm btn-outline" onclick="app.showModalUsuario(${u.id}, '${u.nombre.replace(/'/g,"\\'")}', '${u.email}', '${u.funcion}', ${u.activo})">Editar</button>
                <button class="btn btn-sm btn-danger-outline" onclick="app.deleteUsuario(${u.id}, '${u.nombre.replace(/'/g,"\\'")}')">Eliminar</button>
              </div>
            </div>`;
          }).join('')}
        </div>`;
    } catch (err) { main.innerHTML = `<div class="empty-state"><h4>Error</h4><p>${err.message}</p></div>`; }
  }

  showModalUsuario(id, nombre, email, funcion, activo) {
    const isEdit = !!id;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="modal" style="max-width:420px">
        <div class="modal-header">
          <h2>${isEdit ? 'Editar' : 'Nuevo'} Usuario</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group"><label>Nombre</label><input type="text" id="usr-nombre" value="${nombre || ''}" placeholder="Nombre completo"></div>
          <div class="form-group"><label>Email</label><input type="email" id="usr-email" value="${email || ''}" placeholder="email@ejemplo.com"></div>
          ${isEdit ? '<div class="form-group"><label>Nueva Contrasena (dejar vacio para mantener)</label><input type="password" id="usr-pass" placeholder="Dejar vacio si no cambia"></div>' :
          '<div class="form-group"><label>Contrasena</label><input type="password" id="usr-pass" placeholder="Minimo 6 caracteres"></div>'}
          <div class="form-group"><label>Funcion / Puesto</label>
            <select id="usr-funcion">
              <option value="administrador" ${funcion === 'administrador' ? 'selected' : ''}>Administrador (acceso total)</option>
              <option value="cajero" ${funcion === 'cajero' ? 'selected' : ''}>Cajero (cobros y pedidos)</option>
              <option value="moso" ${funcion === 'moso' ? 'selected' : ''}>Moso (tomar pedidos)</option>
            </select>
          </div>
          ${isEdit ? `
          <div class="form-group"><label>Estado</label>
            <select id="usr-activo">
              <option value="1" ${activo ? 'selected' : ''}>Activo</option>
              <option value="0" ${!activo ? 'selected' : ''}>Inactivo</option>
            </select>
          </div>` : ''}
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
          <button class="btn btn-primary" onclick="app.saveUsuario(${isEdit ? id : 'null'})">${isEdit ? 'Guardar' : 'Crear'}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  async saveUsuario(id) {
    const data = {
      nombre: document.getElementById('usr-nombre').value,
      email: document.getElementById('usr-email').value,
      funcion: document.getElementById('usr-funcion').value,
    };
    const pass = document.getElementById('usr-pass').value;
    if (pass) data.password = pass;
    const activoEl = document.getElementById('usr-activo');
    if (activoEl) data.activo = activoEl.value === '1';
    if (!data.nombre || !data.email) { this.toast('Nombre y email son obligatorios', 'error'); return; }
    if (!id && !pass) { this.toast('La contrasena es obligatoria para nuevos usuarios', 'error'); return; }
    try {
      if (id) { await api.updateUsuario(id, data); }
      else { await api.registerUser({ ...data, password: pass, rol: 'operador' }); }
      document.querySelector('.modal-overlay')?.remove();
      this.toast(id ? 'Usuario actualizado' : 'Usuario creado');
      this.renderUsuarios();
    } catch (err) { this.toast(err.message, 'error'); }
  }

  async deleteUsuario(id, nombre) {
    if (!await this.showConfirm(`¿Eliminar a ${nombre}?`, 'Esta acción no se puede deshacer.', '🗑️', 'Eliminar', true)) return;
    try { await api.deleteUsuario(id); this.toast('Usuario eliminado'); this.renderUsuarios(); }
    catch (err) { this.toast(err.message, 'error'); }
  }

  /* ==================== CONFIGURACION ==================== */
  async renderConfiguracion() {
    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="empty-state"><div class="spinner" style="border-color:var(--primary);border-top-color:transparent;width:32px;height:32px"></div></div>';
    try {
      const emp = await api.getEmpresa();
      main.innerHTML = `
        <div class="gradient-header" style="background:linear-gradient(135deg, #64748b, #475569, #334155)">
          <h1>Configuracion</h1>
          <div class="subtitle">Datos de tu restaurante y cuenta</div>
        </div>
        <div class="config-grid">
          <div class="card fade-up fade-up-1">
            <div class="card-header"><h3>🏪 Datos del Restaurante</h3></div>
            <div class="form-group"><label>Nombre del Restaurante</label><input type="text" id="cfg-nombre" value="${emp.nombre || ''}"></div>
            <div class="form-group"><label>Telefono</label><input type="text" id="cfg-telefono" value="${emp.telefono || ''}"></div>
            <div class="form-group"><label>Direccion</label><input type="text" id="cfg-direccion" value="${emp.direccion || ''}"></div>
            <div class="form-group"><label>Email</label><input type="email" value="${emp.email || ''}" disabled style="opacity:0.6"></div>
            <div class="form-group"><label>Plan</label><input type="text" value="${emp.plan || 'basico'}" disabled style="opacity:0.6"></div>
            <button class="btn btn-primary btn-ripple" onclick="app.saveConfiguracion()" style="border-radius:12px">Guardar Cambios</button>
          </div>
          <div class="card fade-up fade-up-2">
            <div class="card-header"><h3>🔒 Cambiar Contrasena</h3></div>
            <div class="form-group"><label>Contrasena Actual</label><input type="password" id="cfg-pass-actual" placeholder="Tu contrasena actual"></div>
            <div class="form-group"><label>Nueva Contrasena</label><input type="password" id="cfg-pass-nueva" placeholder="Minimo 6 caracteres"></div>
            <div class="form-group"><label>Confirmar Contrasena</label><input type="password" id="cfg-pass-confirm" placeholder="Repite la nueva contrasena"></div>
            <button class="btn btn-warning btn-ripple" onclick="app.changeMyPassword()" style="border-radius:12px">Cambiar Contrasena</button>
          </div>
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

  async changeMyPassword() {
    const actual = document.getElementById('cfg-pass-actual').value;
    const nueva = document.getElementById('cfg-pass-nueva').value;
    const confirm = document.getElementById('cfg-pass-confirm').value;
    if (!actual || !nueva || !confirm) { this.toast('Todos los campos son obligatorios', 'error'); return; }
    if (nueva.length < 6) { this.toast('Minimo 6 caracteres', 'error'); return; }
    if (nueva !== confirm) { this.toast('Las contrasenas no coinciden', 'error'); return; }
    try {
      await api.changePassword({ current_password: actual, new_password: nueva });
      document.getElementById('cfg-pass-actual').value = '';
      document.getElementById('cfg-pass-nueva').value = '';
      document.getElementById('cfg-pass-confirm').value = '';
      this.toast('Contrasena actualizada');
    } catch (err) { this.toast(err.message, 'error'); }
  }

  /* ==================== HISTORIAL ==================== */
  async renderHistorial() {
    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="empty-state"><div class="spinner" style="border-color:var(--primary);border-top-color:transparent;width:32px;height:32px"></div></div>';
    try {
      const params = new URLSearchParams();
      const estadoEl = document.getElementById('hist-estado');
      const fechaIniEl = document.getElementById('hist-fecha-ini');
      const fechaFinEl = document.getElementById('hist-fecha-fin');
      if (estadoEl?.value) params.set('estado', estadoEl.value);
      if (fechaIniEl?.value) params.set('fecha_inicio', fechaIniEl.value);
      if (fechaFinEl?.value) params.set('fecha_fin', fechaFinEl.value);
      const pedidos = await api.getHistorialPedidos(params.toString());
      const mpIcons = { efectivo: '💵', tarjeta: '💳', yape: '📱', plin: '📲', transferencia: '🏦' };
      const mpLabels = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', yape: 'Yape', plin: 'Plin', transferencia: 'Transferencia' };
      main.innerHTML = `
        <div class="gradient-header" style="background:linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa)">
          <h1>Historial</h1>
          <div class="subtitle">${pedidos.length} pedido(s) encontrados</div>
        </div>
        <div class="filtros-bar fade-up">
          <div class="form-group" style="margin:0"><select id="hist-estado" onchange="app.renderHistorial()">
            <option value="">Todos</option><option value="abierto">Abierto</option><option value="cerrado">Cobrado</option><option value="cancelado">Cancelado</option>
          </select></div>
          <div class="form-group" style="margin:0"><input type="date" id="hist-fecha-ini" onchange="app.renderHistorial()"></div>
          <div class="form-group" style="margin:0"><input type="date" id="hist-fecha-fin" onchange="app.renderHistorial()"></div>
          <button class="btn btn-primary btn-ripple" onclick="app.renderHistorial()" style="border-radius:10px">Actualizar</button>
        </div>
        <div class="historial-list fade-up fade-up-1">
          ${pedidos.length === 0 ? '<div class="empty-state" style="padding:48px"><div class="empty-visual" style="width:64px;height:64px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 12px">📋</div><h4>Sin pedidos</h4><p>No se encontraron pedidos con los filtros seleccionados</p></div>' :
          pedidos.map((p, i) => {
            const badge = p.estado === 'cerrado' ? 'success' : p.estado === 'cancelado' ? 'danger' : 'warning';
            const badgeText = p.estado === 'cerrado' ? 'Cobrado' : p.estado;
            return `
            <div class="historial-card fade-up" style="animation-delay:${i * 0.03}s">
              <div class="historial-card-top">
                <div style="display:flex;align-items:center;gap:10px">
                  <span style="font-family:monospace;font-weight:700;color:var(--primary);font-size:15px">${p.numero || p.id.substring(0,6).toUpperCase()}</span>
                  <span class="badge badge-${badge}" style="font-size:10px">${badgeText}</span>
                </div>
                <span style="font-size:15px;font-weight:800;color:var(--success)">${this.formatMoney(p.total)}</span>
              </div>
              <div class="historial-card-bottom">
                <span>${p.mesa_numero ? `Mesa ${p.mesa_numero}` : 'Sin mesa'}</span>
                <span>·</span>
                <span>${p.usuario_nombre || '-'}</span>
                <span>·</span>
                <span>${mpIcons[p.metodo_pago] || '💵'} ${mpLabels[p.metodo_pago] || 'Efectivo'}</span>
                <span>·</span>
                <span style="color:var(--text-muted)">${new Date(p.created_at).toLocaleDateString('es-PE')}</span>
              </div>
            </div>`;
          }).join('')}
        </div>`;
    } catch (err) { main.innerHTML = `<div class="empty-state"><h4>Error</h4><p>${err.message}</p></div>`; }
  }
}

const app = new App();

document.addEventListener('click', (e) => {
  const menu = document.getElementById('mobile-user-menu');
  if (menu && menu.classList.contains('visible')) {
    if (!menu.contains(e.target) && !e.target.closest('.mobile-header-right')) {
      menu.classList.remove('visible');
    }
  }
});
