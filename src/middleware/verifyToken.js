const jwt = require('jsonwebtoken');

// Verifica el JWT enviado en el header "Authorization: Bearer <token>"
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'El token ha expirado' : 'Token inválido';
    return res.status(401).json({ message });
  }
};

module.exports = verifyToken;
