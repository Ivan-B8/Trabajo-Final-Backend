const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

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
    return crearError(409, 'Ya existe una categoría con ese nombre');
  }
  return crearError(500, 'Error interno del servidor');
};

const validarId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw crearError(400, 'El id proporcionado no es válido');
  }
};

const getAllCategories = async () => {
  try {
    return await Category.find().sort({ nombre: 1 });
  } catch (error) {
    throw normalizarError(error);
  }
};

const getCategoryById = async (id) => {
  try {
    validarId(id);
    const categoria = await Category.findById(id);
    if (!categoria) throw crearError(404, 'Categoría no encontrada');
    return categoria;
  } catch (error) {
    throw normalizarError(error);
  }
};

const createCategory = async (data) => {
  try {
    const { nombre, descripcion } = data || {};
    return await Category.create({ nombre, descripcion });
  } catch (error) {
    throw normalizarError(error);
  }
};

const deleteCategory = async (id) => {
  try {
    validarId(id);
    const productosAsociados = await Product.countDocuments({ categoria: id });
    if (productosAsociados > 0) {
      throw crearError(
        409,
        `No se puede eliminar la categoría: tiene ${productosAsociados} producto(s) asociado(s)`
      );
    }
    const categoria = await Category.findByIdAndDelete(id);
    if (!categoria) throw crearError(404, 'Categoría no encontrada');
    return categoria;
  } catch (error) {
    throw normalizarError(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  deleteCategory,
};
