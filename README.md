# Mutuo — Ecommerce de objetos funcionales impresos en 3D

Mutuo es un ecommerce de objetos funcionales para el hogar, diseñados e impresos en 3D.

El proyecto busca combinar orden, practicidad y una estética simple mediante productos personalizables para distintos espacios cotidianos.

## Demo

Aplicación publicada:

> PENDIENTE: agregar enlace de Vercel

Repositorio:

> https://github.com/Jesii-22/final.julio

## Autora

**Jesica Marzeniuk**

Licenciatura en Tecnología Multimedial  
Universidad Maimónides  
Programación III — 2026

## Tecnologías utilizadas

- Next.js
- React
- JavaScript
- Tailwind CSS
- MongoDB
- Mongoose
- Context API
- API Routes
- Vercel

## Funcionalidades principales

### Tienda pública

- Home visual con productos y categorías destacadas.
- Catálogo completo de productos.
- Buscador de productos.
- Filtro por categoría.
- Filtro por disponibilidad de stock.
- Ordenamiento por precio, fecha y nombre.
- Página de categorías.
- Página de productos por categoría.
- Detalle individual de cada producto.
- Productos relacionados.
- Diseño responsive para computadora, tablet y celular.

### Productos personalizables

Cada producto puede incluir diferentes opciones de personalización, por ejemplo:

- Color.
- Tamaño.
- Cantidad de ganchos.
- Otras variantes configuradas desde el dashboard.

Un mismo producto agregado con distintas personalizaciones se guarda como un artículo diferente dentro del carrito.

### Carrito

- Agregar productos.
- Modificar cantidades.
- Eliminar productos.
- Vaciar carrito.
- Mostrar precio unitario, subtotal y total.
- Mostrar las personalizaciones seleccionadas.
- Indicador de progreso para alcanzar el envío gratis.

### Favoritos

- Favoritos temporales para visitantes.
- Favoritos persistentes para usuarios registrados.
- Sincronización de favoritos al iniciar sesión.
- Agregar y quitar productos favoritos.

### Usuarios

- Registro de usuarios.
- Inicio y cierre de sesión.
- Persistencia de usuarios en MongoDB.
- Perfil del usuario.
- Historial de compras.
- Detalle individual de cada orden.

### Checkout

- Datos personales y de contacto.
- Observaciones para la compra.
- Retiro en Mutuo.
- Puntos de encuentro.
- Envío a domicilio.
- Cálculo de costo de envío.
- Envío gratis al superar el monto configurado.
- Selección de fecha y franja horaria para retiros.

### Medios de pago

- Efectivo con descuento.
- Transferencia con descuento.
- Tarjeta de crédito.
- Simulación de cuotas.
- Estado del pago.
- Contacto por WhatsApp o email para comprobantes y retiros.

> integración de tarjeta es una simulación académica. 

### Órdenes

- Creación y persistencia de órdenes en MongoDB.
- Número de orden secuencial.
- Snapshot de los productos comprados.
- Registro de precios, cantidades y personalizaciones.
- Descuento automático de stock.
- Restauración de stock cuando una orden es cancelada.
- Estados de la orden:
  - Recibida o activa (`Active`).
  - Finalizada (`Closed`).
  - Enviada (`Shipped`).
  - Cancelada (`Canceled`).
- Estados del pago:
  - Pendiente (`Pending`).
  - Pagado (`Paid`).
  - Rechazado (`Rejected`).

### Dashboard administrativo

- Acceso protegido para administradores.
- Resumen general del ecommerce.
- Últimas órdenes.
- Total vendido durante el mes.
- Últimos usuarios registrados.
- Productos con stock bajo.
- CRUD de productos.
- CRUD de categorías.
- Administración de órdenes.
- Cambio de estado de orden.
- Cambio de estado de pago.

## Funcionalidades opcionales implementadas

1. Opciones de entrega y envío.
2. Simulación de diferentes medios de pago.
3. Búsqueda de productos.
4. Filtros por categoría y disponibilidad.
5. Autorización para el área administrativa.
6. Metadatos básicos para SEO.

## Rutas principales

### Públicas

```txt
/
/products
/categories
/category/[id]
/product/[id]
/cart
/favorites
/checkout
/login
/register


Uso de inteligencia artificial
Consentimiento

Declaro que utilicé herramientas de inteligencia artificial como apoyo durante el desarrollo de este trabajo práctico.

Su utilización incluyó asistencia para comprender requerimientos, revisar código, detectar errores, analizar posibles soluciones, mejorar textos, explorar alternativas de diseño y generar o editar recursos visuales para los productos.

El código, las decisiones de implementación y las pruebas del funcionamiento fueron revisados e integrados dentro del proyecto de manera consciente.

Reflexión

El uso de inteligencia artificial fue útil para ordenar un proyecto de gran extensión y comprender de manera más clara la relación entre las distintas partes del ecommerce.

La IA funcionó principalmente como una herramienta de acompañamiento para explicar conceptos, proponer estructuras, detectar errores de sintaxis y brindar alternativas ante problemas técnicos. También permitió mejorar la presentación visual y textual de la marca.

Durante el proceso fue necesario revisar las respuestas, adaptar el código a la estructura real del proyecto y realizar pruebas manuales para comprobar que cada funcionalidad trabajara correctamente. Esto permitió entender que la herramienta no reemplaza el conocimiento ni la toma de decisiones, sino que requiere análisis, validación y criterio por parte de quien desarrolla.

Estado del proyecto
ESLint: aprobado.
Build de producción: aprobado.
CRUD de productos y categorías: funcional.
Registro e inicio de sesión: funcional.
Favoritos: funcional.
Carrito y checkout: funcional.
Creación de órdenes: funcional.
Dashboard administrativo: funcional.
Responsive: funcional.
Despliegue en Vercel: pendiente.