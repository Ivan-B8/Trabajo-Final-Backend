const productService = require('../services/productService');

const getAll = async (req, res) => {
  try {
    const productos = await productService.getAllProducts();
    res.status(200).json(productos);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const producto = await productService.getProductById(req.params.id);
    res.status(200).json(producto);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const producto = await productService.createProduct(req.body);
    res.status(201).json(producto);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const producto = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json(producto);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
