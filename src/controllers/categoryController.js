const categoryService = require('../services/categoryService');

const getAll = async (req, res) => {
  try {
    const categorias = await categoryService.getAllCategories();
    res.status(200).json(categorias);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const categoria = await categoryService.getCategoryById(req.params.id);
    res.status(200).json(categoria);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const categoria = await categoryService.createCategory(req.body);
    res.status(201).json(categoria);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(200).json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = { getAll, getById, create, remove };
