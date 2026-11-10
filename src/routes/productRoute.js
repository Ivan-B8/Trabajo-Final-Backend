const express = require('express');
const controller = require('../controllers/productController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Lectura: públicas
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

// Creación, actualización y eliminación: protegidas con JWT
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.remove);

module.exports = router;
