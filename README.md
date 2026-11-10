# API RESTful con CRUD y Capa de Servicios

Trabajo Práctico Final — Curso de Backend Developer (Centro de e-Learning UTN BA).

API RESTful desarrollada con **Node.js, Express y MongoDB (Mongoose)** para gestionar **productos**, **categorías** y **usuarios**. Implementa operaciones CRUD, separa responsabilidades en capas (rutas → controladores → servicios → modelos), encripta contraseñas con **bcrypt** y protege las rutas sensibles con **JWT**.

---

## Arquitectura

```
proyecto-crud-mongodb/
├── app.js                      # Punto de entrada
├── .env                        # Variables de entorno (ejemplo con placeholders)
├── .env.example
├── package.json
└── src/
    ├── models/                 # Esquemas de Mongoose
    │   ├── productModel.js
    │   ├── userModel.js
    │   └── categoryModel.js
    ├── services/               # Lógica de negocio y acceso a la DB
    │   ├── productService.js
    │   ├── userService.js
    │   └── categoryService.js
    ├── controllers/            # Manejo de HTTP (request/response)
    │   ├── productController.js
    │   ├── userController.js
    │   └── categoryController.js
    ├── routes/
    │   ├── productRoute.js
    │   ├── userRoute.js
    │   └── categoryRoute.js
    ├── config/
    │   └── db.js               # Conexión a MongoDB
    └── middleware/
        └── verifyToken.js      # Middleware de verificación JWT
```

- **Servicios**: toda la lógica de negocio y las llamadas a Mongoose viven aquí. Lanzan errores con un código HTTP asociado (400, 404, 409, 401, 500).
- **Controladores**: livianos; reciben la solicitud, delegan en el servicio y devuelven la respuesta con el código HTTP apropiado (`try/catch`).
- **Relaciones**: `Producto.categoria` referencia a `Categoría`. Las lecturas de productos usan `populate` para devolver la categoría completa.

---

## Esquema de la base de datos

Base de datos: `proyecto_crud`. Todas las colecciones incluyen `createdAt` y `updatedAt` (timestamps de Mongoose).

### Colección `products`

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | String | Obligatorio, trim |
| `descripcion` | String | Opcional, por defecto `""` |
| `precio` | Number | Obligatorio, mínimo 0 |
| `stock` | Number | Obligatorio, mínimo 0, por defecto 0 |
| `categoria` | ObjectId (ref `Category`) | Obligatorio, debe existir |

### Colección `categories`

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | String | Obligatorio, único, trim |
| `descripcion` | String | Opcional, por defecto `""` |

### Colección `users`

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | String | Obligatorio |
| `email` | String | Obligatorio, único, minúsculas, formato válido |
| `password` | String | Obligatorio, mínimo 6 caracteres. Se guarda **hasheada** con bcrypt (pre-save hook) y nunca se devuelve en las respuestas |

---

## Tecnologías utilizadas

- Node.js
- Express 4
- MongoDB + Mongoose 8
- bcrypt (hash de contraseñas)
- jsonwebtoken (JWT)
- dotenv (variables de entorno)
- cors

---

## Cómo correr el proyecto

**Requisitos:** Node.js 18 o superior y una instancia de MongoDB (local o MongoDB Atlas).

```bash
# 1. Clonar el repositorio
git clone https://github.com/Ivan-B8/Trabajo-Final.git
cd Trabajo-Final

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
#    Editar el archivo .env con tu cadena de conexión y tu clave secreta (ver sección siguiente)

# 4. Iniciar el servidor
npm start
#    o, en modo desarrollo (reinicia al guardar cambios):
npm run dev
```

El servidor queda disponible en `http://localhost:3000`.

### Archivo `.env`

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/proyecto_crud
# Ejemplo con MongoDB Atlas (reemplazar los placeholders):
# MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/proyecto_crud?retryWrites=true&w=majority
JWT_SECRET=cambia_esta_clave_secreta_por_una_larga_y_aleatoria
JWT_EXPIRES_IN=1h
```

> Este `.env` se incluye en el repositorio a propósito, con credenciales de ejemplo/placeholders, tal como lo pide la consigna de entrega. En un proyecto real **nunca** se debe subir un `.env` con credenciales verdaderas.

---

## Autenticación

Las rutas de **creación, actualización y eliminación** requieren un JWT en el header:

```
Authorization: Bearer <token>
```

Flujo: registrarse (`POST /api/users/register`) → iniciar sesión (`POST /api/users/login`) → usar el `token` devuelto en las rutas protegidas.

---

## Endpoints

### Usuarios — `/api/users`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/users/register` | No | Registrar un usuario |
| POST | `/api/users/login` | No | Iniciar sesión y obtener JWT |
| GET | `/api/users` | Sí | Listar usuarios |

### Categorías — `/api/categories`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/categories` | No | Listar categorías |
| GET | `/api/categories/:id` | No | Obtener una categoría |
| POST | `/api/categories` | Sí | Crear una categoría |
| DELETE | `/api/categories/:id` | Sí | Eliminar una categoría (falla con 409 si tiene productos asociados) |

### Productos — `/api/products`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/products` | No | Listar productos (con la categoría poblada) |
| GET | `/api/products/:id` | No | Obtener un producto (con la categoría poblada) |
| POST | `/api/products` | Sí | Crear un producto |
| PUT | `/api/products/:id` | Sí | Actualizar un producto (campos parciales) |
| DELETE | `/api/products/:id` | Sí | Eliminar un producto |

### Códigos de respuesta utilizados

| Código | Uso |
|---|---|
| 200 | Operación exitosa |
| 201 | Recurso creado |
| 400 | Datos inválidos, id mal formado o validación fallida |
| 401 | Token ausente/inválido/expirado o credenciales incorrectas |
| 404 | Recurso o ruta no encontrada |
| 409 | Conflicto (email o nombre de categoría duplicado; categoría con productos) |
| 500 | Error interno del servidor |

---

## Ejemplos de datos Mock (JSON)

### Registrar usuario — `POST /api/users/register`

Request:
```json
{
  "nombre": "Ana Pérez",
  "email": "ana@example.com",
  "password": "123456"
}
```
Response `201`:
```json
{
  "_id": "665f1c2e8b1c2a0012a1b001",
  "nombre": "Ana Pérez",
  "email": "ana@example.com",
  "createdAt": "2026-10-05T17:00:00.000Z",
  "updatedAt": "2026-10-05T17:00:00.000Z"
}
```

### Iniciar sesión — `POST /api/users/login`

Request:
```json
{
  "email": "ana@example.com",
  "password": "123456"
}
```
Response `200`:
```json
{
  "message": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "_id": "665f1c2e8b1c2a0012a1b001",
    "nombre": "Ana Pérez",
    "email": "ana@example.com"
  }
}
```
Response `401` (credenciales incorrectas):
```json
{ "message": "Credenciales inválidas" }
```

### Crear categoría — `POST /api/categories` (requiere token)

Request:
```json
{
  "nombre": "Electrónica",
  "descripcion": "Dispositivos y accesorios electrónicos"
}
```
Response `201`:
```json
{
  "_id": "665f1c2e8b1c2a0012a1c001",
  "nombre": "Electrónica",
  "descripcion": "Dispositivos y accesorios electrónicos",
  "createdAt": "2026-10-05T17:05:00.000Z",
  "updatedAt": "2026-10-05T17:05:00.000Z",
  "__v": 0
}
```

### Listar categorías — `GET /api/categories`

Response `200`:
```json
[
  {
    "_id": "665f1c2e8b1c2a0012a1c001",
    "nombre": "Electrónica",
    "descripcion": "Dispositivos y accesorios electrónicos"
  }
]
```

### Eliminar categoría — `DELETE /api/categories/:id` (requiere token)

Response `200`:
```json
{ "message": "Categoría eliminada correctamente" }
```
Response `409` (si tiene productos):
```json
{ "message": "No se puede eliminar la categoría: tiene 3 producto(s) asociado(s)" }
```

### Crear producto — `POST /api/products` (requiere token)

Request:
```json
{
  "nombre": "Auriculares Bluetooth",
  "descripcion": "Auriculares inalámbricos con cancelación de ruido",
  "precio": 59999.99,
  "stock": 25,
  "categoria": "665f1c2e8b1c2a0012a1c001"
}
```
Response `201`:
```json
{
  "_id": "665f1c2e8b1c2a0012a1d001",
  "nombre": "Auriculares Bluetooth",
  "descripcion": "Auriculares inalámbricos con cancelación de ruido",
  "precio": 59999.99,
  "stock": 25,
  "categoria": {
    "_id": "665f1c2e8b1c2a0012a1c001",
    "nombre": "Electrónica",
    "descripcion": "Dispositivos y accesorios electrónicos"
  },
  "createdAt": "2026-10-05T17:10:00.000Z",
  "updatedAt": "2026-10-05T17:10:00.000Z"
}
```

### Listar / obtener productos — `GET /api/products` y `GET /api/products/:id`

Response `200` (la categoría viene poblada):
```json
[
  {
    "_id": "665f1c2e8b1c2a0012a1d001",
    "nombre": "Auriculares Bluetooth",
    "descripcion": "Auriculares inalámbricos con cancelación de ruido",
    "precio": 59999.99,
    "stock": 25,
    "categoria": {
      "_id": "665f1c2e8b1c2a0012a1c001",
      "nombre": "Electrónica",
      "descripcion": "Dispositivos y accesorios electrónicos"
    }
  }
]
```

### Actualizar producto — `PUT /api/products/:id` (requiere token)

Request (solo los campos a modificar):
```json
{
  "precio": 54999.99,
  "stock": 20
}
```
Response `200`: el producto actualizado, con la categoría poblada.

### Eliminar producto — `DELETE /api/products/:id` (requiere token)

Response `200`:
```json
{ "message": "Producto eliminado correctamente" }
```

### Ejemplos de errores

`401` sin token:
```json
{ "message": "Token no proporcionado" }
```
`404` producto inexistente:
```json
{ "message": "Producto no encontrado" }
```
`400` validación:
```json
{ "message": "El precio es obligatorio" }
```

### Ejemplo con curl

```bash
# Registro y login
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana Pérez","email":"ana@example.com","password":"123456"}'

curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@example.com","password":"123456"}'

# Crear categoría con el token obtenido
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"nombre":"Electrónica","descripcion":"Dispositivos y accesorios electrónicos"}'
```

---

## Funcionalidades implementadas

- CRUD completo de **productos** (GET, GET por id, POST, PUT, DELETE).
- **Categorías** con GET, GET por id, POST y DELETE.
- Registro y login de **usuarios**.
- Relación Producto → Categoría con `populate` en las lecturas.
- **Capa de servicios** con toda la lógica de negocio y acceso a Mongoose; controladores livianos.
- Validaciones de negocio: la categoría de un producto debe existir; no se puede borrar una categoría con productos asociados; email y nombre de categoría únicos.
- Manejo de errores y códigos HTTP (200, 201, 400, 401, 404, 409, 500) con `try/catch`.
- Hash de contraseñas con **bcrypt** mediante un pre-save hook.
- Autenticación **JWT** y middleware `verifyToken` para proteger creación, actualización y eliminación.
- Variables de entorno con **dotenv** y **CORS** habilitado en `app.js`.

## Funcionalidades a futuro

- Paginación, filtros y búsqueda en el listado de productos.
- Roles de usuario (administrador / usuario) y autorización por rol.
- Actualización de categorías (PUT).
- Validación de entradas con una librería dedicada (Joi, Zod o express-validator).
- Tests automatizados (Jest + Supertest).
- Documentación interactiva con Swagger/OpenAPI.
- Deploy en un servicio de hosting y frontend de consumo.
