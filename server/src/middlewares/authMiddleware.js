const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'senhajwt';

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('AuthMiddleware: Verificando token...');
  console.log('AuthMiddleware: AuthHeader:', authHeader);
  console.log('AuthMiddleware: Token extraído:', token ? 'SIM' : 'NÃO');

  if (!token) {
    console.log('AuthMiddleware: Token não fornecido');
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log('AuthMiddleware: Token válido, usuário:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('AuthMiddleware: Erro ao verificar token:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado.' });
    }
    return res.status(403).json({ message: 'Token inválido.' });
  }
};