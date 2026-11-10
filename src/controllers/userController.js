const userService = require('../services/userService');

const register = async (req, res) => {
  try {
    const usuario = await userService.registerUser(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { token, usuario } = await userService.loginUser(req.body);
    res.status(200).json({ message: 'Inicio de sesión exitoso', token, usuario });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const usuarios = await userService.getAllUsers();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = { register, login, getAll };
