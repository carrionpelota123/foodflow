# ECSYSTEM - Sistema de Gestion de Restaurantes

Sistema SaaS completo para la gestion de restaurantes, incluyendo punto de venta, mesas, menu, reportes, caja y boletas electronicas.

## REQUISITOS PREVIOS

Para ejecutar este sistema en tu laptop necesitas tener instalado:

- **Node.js** version 18 o superior
  - Descargar desde: https://nodejs.org
  - Verificar instalacion: abrir una terminal y ejecutar `node --version`
- **NPM** (viene incluido con Node.js)
  - Verificar: `npm --version`

### Sistemas Operativos Compatibles
- Windows 10/11
- macOS
- Linux (Ubuntu, Fedora, etc.)

---

## INSTALACION LOCAL

### Paso 1: Copiar los archivos

Copia toda la carpeta del proyecto a tu laptop. Asegurate de que contenga esta estructura:

```
Default Project/
├── package.json
├── src/
│   ├── server.js
│   ├── db/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   └── routes/
│       ├── auth.js
│       ├── mesas.js
│       ├── pedidos.js
│       ├── productos.js
│       └── reportes.js
├── public/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js
│       └── app.js
└── MANUAL.md
```

### Paso 2: Abrir terminal

**Windows:**
- Presiona `Win + R`, escribe `cmd` y presiona Enter
- O busca "PowerShell" en el menu de Windows
- Navega hasta la carpeta del proyecto:
  ```
  cd "C:\Users\TU_USUARIO\Documents\Default Project"
  ```

**Mac/Linux:**
- Abre la Terminal
- Navega hasta la carpeta del proyecto:
  ```
  cd /ruta/a/Default\ Project
  ```

### Paso 3: Instalar dependencias

Ejecuta el siguiente comando en la terminal:

```bash
npm install
```

Esto descargara todas las librerias necesarias (Express, SQLite, etc.). Tardara unos segundos.

### Paso 4: Iniciar el servidor

```bash
npm start
```

Deberas ver un mensaje como:

```
=========================================
 Restaurante SaaS - Servidor activo
 http://localhost:3000
=========================================
```

### Paso 5: Abrir el navegador

Abre tu navegador web (Chrome, Firefox, Edge) y ve a:

```
http://localhost:3000
```

Listo! El sistema esta funcionando.

---

## ESTRUCTURA DEL PROYECTO

### Backend (Servidor)

| Archivo | Funcion |
|---|---|
| `src/server.js` | Punto de entrada del servidor Express |
| `src/db/database.js` | Base de datos SQLite y esquema de tablas |
| `src/middleware/auth.js` | Autenticacion JWT y permisos |
| `src/routes/auth.js` | Registro, login y gestion de usuarios |
| `src/routes/mesas.js` | API de mesas (CRUD) |
| `src/routes/pedidos.js` | API de pedidos (crear, items, cerrar, cancelar) |
| `src/routes/productos.js` | API de menu y categorias |
| `src/routes/reportes.js` | API de reportes y caja |

### Frontend (Navegador)

| Archivo | Funcion |
|---|---|
| `public/index.html` | Pagina principal del sistema |
| `public/css/style.css` | Estilos visuales del sistema |
| `public/js/api.js` | Cliente de comunicacion con el servidor |
| `public/js/app.js` | Logica completa de la aplicacion |

### Base de Datos

El sistema usa **SQLite** (base de datos en archivo). El archivo se crea automaticamente:

```
restaurant.db
```

No necesitas instalar un servidor de base de datos separado.

---

## API ENDPOINTS

### Autenticacion
| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/api/auth/register` | Crear cuenta nueva (empresa + admin) |
| POST | `/api/auth/login` | Iniciar sesion |
| GET | `/api/auth/me` | Obtener datos del usuario actual |
| POST | `/api/auth/register-user` | Crear usuario (admin) |

### Mesas
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/mesas` | Listar todas las mesas |
| GET | `/api/mesas/:id` | Obtener una mesa con pedido actual |
| POST | `/api/mesas` | Crear mesa |
| PUT | `/api/mesas/:id` | Actualizar mesa |
| DELETE | `/api/mesas/:id` | Eliminar mesa |

### Menu
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/menu/categorias` | Listar categorias |
| POST | `/api/menu/categorias` | Crear categoria |
| PUT | `/api/menu/categorias/:id` | Actualizar categoria |
| DELETE | `/api/menu/categorias/:id` | Eliminar categoria |
| GET | `/api/menu/productos` | Listar productos |
| POST | `/api/menu/productos` | Crear producto |
| PUT | `/api/menu/productos/:id` | Actualizar producto |
| DELETE | `/api/menu/productos/:id` | Eliminar producto |

### Pedidos
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/pedidos` | Listar pedidos |
| GET | `/api/pedidos/:id` | Obtener pedido con detalles |
| POST | `/api/pedidos` | Crear pedido |
| POST | `/api/pedidos/:id/items` | Agregar item al pedido |
| DELETE | `/api/pedidos/:id/items/:itemId` | Eliminar item |
| PUT | `/api/pedidos/:id/cerrar` | Cerrar/cobrar pedido |
| PUT | `/api/pedidos/:id/cancelar` | Cancelar pedido |

### Reportes
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/reportes/dashboard` | Datos del dashboard |
| GET | `/api/reportes/ventas` | Reporte de ventas por fecha |
| GET | `/api/reportes/productos-mas-vendidos` | Top productos vendidos |
| GET | `/api/reportes/cuadre-caja` | Cuadre de caja del dia |
| POST | `/api/reportes/caja/abrir` | Abrir caja |
| POST | `/api/reportes/caja/cerrar` | Cerrar caja |

---

## DETECION DE CAMBIOS EN DESARROLLO

Si quieres modificar el codigo y que se refleje sin reiniciar manualmente:

```bash
npm run dev
```

Esto usa `node --watch` para reiniciar automaticamente el servidor cuando detecta cambios en los archivos.

---

## SOLUCION DE PROBLEMAS

### "Error: listen EADDRINUSE: address already in use :::3000"
El puerto 3000 ya esta en uso. Soluciones:
1. Cierra la otra ventana de terminal que tenga el servidor corriendo
2. O cambia el puerto editando `src/server.js`:
   ```javascript
   const PORT = process.env.PORT || 3001;
   ```
   Luego accede a `http://localhost:3001`

### "Error: Cannot find module"
Faltan dependencias. Ejecuta:
```bash
npm install
```

### "Module not found: better-sqlite3"
En algunos sistemas necesitas compilar mejor-sqlite3:
```bash
npm rebuild better-sqlite3
```

### La base de datos esta corrupta
Elimina el archivo `restaurant.db` y reinicia el servidor. Se creara una nueva.

```bash
# Windows
del restaurant.db

# Mac/Linux
rm restaurant.db
```

### No se abre el navegador automaticamente
Ingresa manualmente `http://localhost:3000` en tu navegador.

---

## PERSONALIZACION

### Cambiar el IVA
Edita `src/routes/pedidos.js`, funcion `recalcularPedido`:
```javascript
const impuestos = subtotal * 0.16; // Cambia 0.16 por el porcentaje deseado
```

### Cambiar el puerto
Edita `src/server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Cambia 3000 por otro puerto
```

### Agregar datos de prueba
Puedes crear usuarios de prueba desde la interfaz o directamente usando la API con el token de administrador.

---

## TECHNLOGIAS UTILIZADAS

- **Backend**: Node.js + Express 4
- **Base de datos**: SQLite (better-sqlite3)
- **Autenticacion**: JWT (JSON Web Tokens)
- **Frontend**: HTML5 + CSS3 + JavaScript vanilla
- **Fuentes**: Google Fonts (Inter)
- **PDF**: html2pdf.js
- **Seguridad**: bcryptjs para contrasenas

---

## LICENCIA

Proyecto de uso interno / educativo.

---

*ECSYSTEM v1.0 - Desarrollado con Node.js*
