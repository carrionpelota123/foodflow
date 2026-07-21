# MANUAL DE USUARIO - ECSYSTEM

## Sistema de Gestion de Restaurantes

---

## INDICE

1. [Primeros Pasos](#1-primeros-pasos)
2. [Inicio de Sesion](#2-inicio-de-sesion)
3. [Roles y Permisos](#3-roles-y-permisos)
4. [Dashboard](#4-dashboard)
5. [Gestion de Mesas](#5-gestion-de-mesas)
6. [Punto de Venta (POS)](#6-punto-de-venta-pos)
7. [Menu y Productos](#7-menu-y-productos)
8. [Cobro y Boleta Electronica](#8-cobro-y-boleta-electronica)
9. [Reportes](#9-reportes)
10. [Caja](#10-caja)
11. [Gestion de Usuarios](#11-gestion-de-usuarios)
12. [Solucion de Problemas](#12-solucion-de-problemas)

---

## 1. PRIMEROS PASOS

### 1.1 Crear tu cuenta

1. Abre el navegador y ve a `http://localhost:3000`
2. Haz clic en la pestana **"Crear Cuenta"**
3. Completa los datos:
   - **Nombre del restaurante**: El nombre de tu negocio
   - **Email del restaurante**: Correo electronico del negocio
   - **Telefono**: Numero de contacto
   - **Tu nombre**: Nombre del administrador
   - **Tu correo**: Correo electronico personal
   - **Contrasena**: Minimo 6 caracteres
4. Haz clic en **"Crear Cuenta"**

> Se crearan automaticamente 10 mesas y 4 categorias de ejemplo.

### 1.2 Datos de prueba

El sistema crea un usuario administrador. Puedes crear mas usuarios desde la seccion **Usuarios**.

---

## 2. INICIO DE SESION

1. Ingresa tu **correo electronico**
2. Ingresa tu **contrasena**
3. Haz clic en **"Iniciar Sesion"**

Si olvidaste tu contrasena, contacta al administrador del sistema.

---

## 3. ROLES Y PERMISOS

ECSYSTEM maneja 3 funciones de usuario:

### Administrador
- Acceso completo a todas las secciones
- Dashboard, Mesas, POS, Menu, Reportes, Caja, Usuarios
- Puede crear, editar y eliminar cualquier dato
- Puede cobrar pedidos

### Cajero
- Ve la lista de pedidos abiertos
- Puede cobrar pedidos desde el POS o desde la lista
- Puede gestionar la caja (abrir/cerrar)
- NO puede editar el menu ni las mesas

### Moso (Mesero)
- Ve las mesas y el punto de venta
- Puede crear pedidos y agregar productos
- Puede cancelar pedidos propios
- NO puede cobrar (solo el cajero o administrador)
- NO tiene acceso a reportes, caja ni configuracion

---

## 4. DASHBOARD

El dashboard es la pantalla principal que muestra un resumen en tiempo real:

- **Mesas**: Cuantas estan ocupadas vs total
- **Pedidos Abiertos**: Pedidos activos sin cobrar
- **Ventas Hoy**: Total vendido en el dia
- **Ventas del Mes**: Acumulado mensual
- **Top Productos**: Los mas vendidos del dia

> Haz clic en "Ver Mesas" o "Ir al POS" para rapido acceso.

---

## 5. GESTION DE MESAS

### Ver mesas
- Las mesas se muestran como tarjetas con semaforo de color:
  - **Verde (Libre)**: Sin pedidos activos
  - **Rojo (Ocupada)**: Tiene un pedido abierto
  - **Amarillo (Reservada)**: Reservada

### Crear una mesa (Administrador)
1. Haz clic en **"+ Nueva Mesa"**
2. Ingresa el numero de mesa
3. Define la capacidad (personas)
4. Opcionalmente agrega una ubicacion (Terraza, Interior, etc.)
5. Haz clic en **"Crear Mesa"**

### Usar una mesa
1. Haz clic sobre la mesa
2. Si esta **libre**: se crea un pedido automatico y te lleva al POS
3. Si esta **ocupada**: te lleva al pedido activo de esa mesa

### Editar/Eliminar mesa (Administrador)
1. Haz clic en la mesa
2. En el modal de mesa, haz clic en **"Editar"**
3. Modifica los datos o haz clic en **"Eliminar"**

---

## 6. PUNTO DE VENTA (POS)

El POS es donde se toman los pedidos y se agregan productos.

### Seleccionar mesa
1. Haz clic en **"Cambiar Mesa"**
2. Selecciona la mesa deseada

### Agregar productos
1. Navega por las **categorias** usando los botones superiores
2. Haz clic en el producto que deseas agregar
3. El producto se agrega con cantidad 1 al pedido actual
4. Puedes agregar multiples veces el mismo producto

### Ver el pedido actual
- En el panel derecho se muestra el resumen del pedido
- Subtotal, IVA (16%) y Total
- Puedes eliminar items con el boton **x**

### Cancelar pedido
1. Haz clic en **"Cancelar Pedido"**
2. Confirma la accion
3. Los productos se devuelven al stock

### Cobrar pedido (Solo Cajero/Administrador)
1. Haz clic en **"Cobrar Pedido"**
2. Confirma el cobro
3. Se abre el modal de boleta electronica

---

## 7. MENU Y PRODUCTOS

### Ver productos
- Pestana **Productos**: Lista completa con precio, stock y estado
- Pestana **Categorias**: Lista de categorias del menu

### Crear producto (Administrador)
1. Haz clic en **"+ Nuevo Producto"**
2. Completa:
   - **Nombre**: Nombre del plato/bebida
   - **Categoria**: Selecciona la categoria
   - **Precio**: Precio en soles (S/)
   - **Stock**: Cantidad disponible (-1 = ilimitado)
   - **Descripcion**: Descripcion opcional
   - **Disponible**: Marca si esta disponible para venta
3. Haz clic en **"Crear Producto"**

### Editar producto
1. Haz clic en **"Editar"** junto al producto
2. Modifica los campos necesarios
3. Haz clic en **"Guardar"**

### Crear categoria
1. Ve a la pestana **Categorias**
2. Haz clic en **"+ Nueva Categoria"**
3. Ingresa el nombre y el orden
4. Haz clic en **"Crear"**

### Eliminar
- Haz clic en **"Eliminar"** junto al producto o categoria
- Confirma la accion

---

## 8. COBRO Y BOLETA ELECTRONICA

Al cobrar un pedido, se genera una **Boleta de Venta Electronica** con formato de impresora termica (80mm).

### Opciones de boleta

#### Ver boleta
Haz clic en **"Ver Boleta"** para previsualizar antes de descargar.

#### Descargar PDF
1. Haz clic en **"PDF"**
2. Se descarga un archivo PDF con formato de boleta electronica
3. Incluye: RUC, numero de boleta, fecha, items, totales y codigo de barras

#### Descargar Imagen
1. Haz clic en **"Imagen"**
2. Se descarga una imagen PNG de la boleta
3. Ideal para enviar por WhatsApp o redes sociales

#### Enviar por WhatsApp (Imagen)
1. Ingresa el **numero de telefono** del cliente (sin codigo de pais)
   - Ejemplo: `999888777`
2. Haz clic en **"Enviar"**
3. Se genera la imagen y se descarga
4. Se abre WhatsApp Web listo para enviar
5. **Adjunta la imagen descargada** al chat de WhatsApp

#### Imprimir
1. Haz clic en **"Imprimir"**
2. Se abre una ventana con formato de impresion
3. Selecciona tu impresora termica (80mm recomendado)
4. Imprime la boleta

### Formato de boleta
La boleta incluye:
- Nombre y RUC del restaurante
- Numero de serie y correlativo
- Fecha y hora exacta
- Mesa y vendedor
- Descripcion, cantidad, precio unitario y subtotal de cada item
- Subtotal, IVA y total
- Mensaje de SUNAT
- Codigo de barras ASCII
- Numero de pedido para referencias

---

## 9. REPORTES

Disponible solo para **Administradores**.

### Resumen del mes
- **Ventas del Mes**: Monto total vendido
- **Pedidos del Mes**: Cantidad de pedidos cerrados
- **Ventas Hoy**: Monto vendido hoy

### Productos Mas Vendidos
- Tabla con los productos mas vendidos
- Muestra cantidad vendida e ingreso generado

### Ventas por Dia
- Desglose diario de ventas
- Cantidad de pedidos y monto por dia

---

## 10. CAJA

Disponible para **Cajeros y Administradores**.

### Abrir caja
1. Ve a la seccion **Caja**
2. Ingresa el **monto inicial** (efectivo con el que empiezas el dia)
3. Haz clic en **"Abrir Caja"**

### Ver estado
- **Fondo de Caja**: Monto con el que se abrio
- **Total Ventas**: Vendido en el dia
- **Efectivo Esperado**: Fondo + Ventas
- **Pedidos cerrados**: Cantidad de cobros realizados

### Cerrar caja
1. Haz clic en **"Cerrar Caja del Dia"**
2. Confirma el cierre
3. La caja queda registrada como cerrada

> Solo se puede tener una caja abierta por dia.

---

## 11. GESTION DE USUARIOS

Disponible solo para **Administradores**.

### Crear usuario
1. Ve a la seccion **Usuarios**
2. Haz clic en **"+ Nuevo Usuario"**
3. Completa:
   - **Nombre**: Nombre completo
   - **Email**: Correo electronico (sera su usuario de login)
   - **Contrasena**: Minimo 6 caracteres
   - **Rol del Sistema**: Admin u Operador
   - **Funcion / Puesto**: Administrador, Cajero o Moso
4. Haz clic en **"Crear Usuario"**

### Roles vs Funciones

| Rol del Sistema | Funcion | Que puede hacer |
|---|---|---|
| admin | administrador | Acceso total al sistema |
| operador | administrador | Acceso total pero sin permisos de admin de empresa |
| operador | cajero | Pedidos + Cobros + Caja |
| operador | moso | Mesas + Tomar pedidos |

---

## 12. SOLUCION DE PROBLEMAS

### No puedo iniciar sesion
- Verifica que el correo y contrasena sean correctos
- Contacta al administrador para verificar que tu usuario este activo

### No puedo cobrar
- Verifica que tu funcion sea "Cajero" o "Administrador"
- Los mosos no pueden cobrar pedidos

### Los productos no aparecen en el POS
- Verifica que esten marcados como "Disponible" en Menu
- Verifica que tengan stock (si stock > 0 o stock = -1 para ilimitado)

### La mesa no se libera despues de cobrar
- El sistema libera la mesa automaticamente al cobrar
- Si no se libero, verifica que el pedido se haya cerrado correctamente

### No puedo editar mesas o productos
- Solo los administradores pueden editar la configuracion
- Verifica tu funcion de usuario

### El navegador no imprime bien la boleta
- Configura la impresora para papel de 80mm
- Desactiva los margenes en la configuracion de impresion
- Selecciona "Ajustar al contenido" si esta disponible

---

## GLOSARIO

| Termino | Significado |
|---|---|
| POS | Punto de Venta - Donde se toman los pedidos |
| IVA | Impuesto al Valor Agregado (16%) |
| Boleta | Comprobante de venta al consumidor final |
| RUC | Registro Unico de Contribuyente |
| SUNAT | Superintendencia Nacional de Aduanas y de Administracion Tributaria |
| Moso | Mesero - Toma los pedidos de las mesas |
| Cajero | Persona encargada de cobrar los pedidos |
| Stock | Cantidad disponible de un producto |
| Pedido | Conjunto de productos que solicita un cliente |
| Mesa | Numero de mesa asignada a un pedido |
| Caja | Registro de efectivo del dia |

---

*ECSYSTEM v1.0 - Sistema de Gestion de Restaurantes*
