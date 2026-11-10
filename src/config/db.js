const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('La variable de entorno MONGODB_URI no está definida');
  }
  await mongoose.connect(uri);
  console.log('Conectado a MongoDB');
};

module.exports = connectDB;
