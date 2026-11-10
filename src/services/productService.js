const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

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
  if (error.name === 'CastError') {
    return crearError(400, `Valor inválido para el campo "${error.path}"`);
  }
  return crearError(500, 'Error interno del servidor');
};

const validarId = (id, nombreCampo = 'id') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw crearError(400, `El ${nombreCampo} proporcionado no es válido`);
  }
};

const verificarCategoriaExiste = async (categoriaId) => {
  validarId(categoriaId, 'id de categoría');
  const existe = await Category.exists({ _id: categoriaId });
  if (!existe) throw crearError(404, 'La categoría indicada no existe');
};

const getAllProducts = async () => {
  try {
    // populate: incluye los datos completos de la categoría
    return await Product.find().populate('categoria').sort({ createdAt: -1 });
  } catch (error) {
    throw normalizarError(error);
  }
};

const getProductById = async (id) => {
  try {
    validarId(id);
    const producto = await Product.findById(id).populate('categoria');
    if (!producto) throw crearError(404, 'Producto no encontrado');
    return producto;
  } catch (error) {
    throw normalizarError(error);
  }
};

const createProduct = async (data) => {
  try {
    const { nombre, descripcion, precio, stock, categoria } = data || {};
    if (!categoria) throw crearError(400, 'La categoría es obligatoria');
    await verificarCategoriaExiste(categoria);

    const producto = await Product.create({ nombre, descripcion, precio, stock, categoria });
    return await producto.populate('categoria');
  } catch (error) {
    throw normalizarError(error);
  }
};

const updateProduct = async (id, data) => {
  try {
    validarId(id);
    const { nombre, descripcion, precio, stock, categoria } = data || {};
    const cambios = { nombre, descripcion, precio, stock, categoria };
    // Solo actualizar los campos enviados
    Object.keys(cambios).forEach((k) => cambios[k] === undefined && delete cambios[k]);

    if (Object.keys(cambios).length === 0) {
      throw crearError(400, 'No se enviaron campos para actualizar');
    }
    if (cambios.categoria) await verificarCategoriaExiste(cambios.categoria);

    const producto = await Product.findByIdAndUpdate(id, cambios, {
      new: true,
      runValidators: true,
    }).populate('categoria');
    if (!producto) throw crearError(404, 'Producto no encontrado');
    return producto;
  } catch (error) {
    throw normalizarError(error);
  }
};

const deleteProduct = async (id) => {
  try {
    validarId(id);
    const producto = await Product.findByIdAndDelete(id);
    if (!producto) throw crearError(404, 'Producto no encontrado');
    return producto;
  } catch (error) {
    throw normalizarError(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
