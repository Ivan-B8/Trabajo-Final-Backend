require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const productRoute = require('./src/routes/productRoute');
const categoryRoute = require('./src/routes/categoryRoute');
const userRoute = require('./src/routes/userRoute');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Ruta de salud / bienvenida
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API RESTful - Productos, Categorías y Usuarios' });
});

// Rutas
app.use('/api/products', productRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/users', userRoute);

// 404 para rutas inexistentes
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores no controlados (ej. JSON malformado)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON inválido en el cuerpo de la solicitud' });
  }
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('Error al conectar con MongoDB:', error.message);
    process.exit(1);
  });

module.exports = app;
