const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const crearError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// Traduce errores de Mongoose a errores HTTP con su código correspondiente
const normalizarError = (error) => {
  if (error.status) return error;
  if (error.name === 'ValidationError') {
    const mensajes = Object.values(error.errors).map((e) => e.message);
    return crearError(400, mensajes.join('. '));
  }
  if (error.code === 11000) {
    return crearError(409, 'Ya existe un usuario con ese email');
  }
  return crearError(500, 'Error interno del servidor');
};

const registerUser = async (data) => {
  try {
    const { nombre, email, password } = data || {};
    // El hash de la contraseña lo aplica el pre-save hook del modelo
    return await User.create({ nombre, email, password });
  } catch (error) {
    throw normalizarError(error);
  }
};

const loginUser = async (data) => {
  try {
    const { email, password } = data || {};
    if (!email || !password) {
      throw crearError(400, 'El email y la contraseña son obligatorios');
    }

    const usuario = await User.findOne({ email: email.toLowerCase().trim() });
    // Mismo mensaje para email inexistente o contraseña incorrecta (evita enumerar usuarios)
    if (!usuario || !(await usuario.compararPassword(password))) {
      throw crearError(401, 'Credenciales inválidas');
    }

    if (!process.env.JWT_SECRET) {
      throw crearError(500, 'JWT_SECRET no está configurado en el servidor');
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return { token, usuario };
  } catch (error) {
    throw normalizarError(error);
  }
};

const getAllUsers = async () => {
  try {
    return await User.find().sort({ createdAt: -1 });
  } catch (error) {
    throw normalizarError(error);
  }
};

module.exports = { registerUser, loginUser, getAllUsers };
