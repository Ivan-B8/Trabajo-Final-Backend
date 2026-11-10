const express = require('express');
const controller = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Registro e inicio de sesión: públicos
router.post('/register', controller.register);
router.post('/login', controller.login);

// Listado de usuarios: protegido con JWT
router.get('/', verifyToken, controller.getAll);

module.exports = router;
