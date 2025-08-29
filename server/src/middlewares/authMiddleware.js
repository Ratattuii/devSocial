const jwt = require('jsonwebtoken');

// Chave secreta para assinar e verificar tokens JWT (a mesma usada em authController.js)
const jwtSecret = process.env.JWT_SECRET || 'senhajwt'; // Use a mesma do controller!

exports.verifyToken = (req, res, next) => {
  // Obter o token do cabeçalho de autorização
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

  console.log('AuthMiddleware: Verificando token...');
  console.log('AuthMiddleware: AuthHeader:', authHeader);
  console.log('AuthMiddleware: Token extraído:', token ? 'SIM' : 'NÃO');

  if (!token) {
    console.log('AuthMiddleware: Token não fornecido');
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // Verificar o token
    const decoded = jwt.verify(token, jwtSecret);
    console.log('AuthMiddleware: Token válido, usuário:', decoded);
    req.user = decoded; // Adiciona as informações do usuário decodificadas ao objeto de requisição
    next(); // Continua para a próxima função middleware/rota
  } catch (error) {
    console.log('AuthMiddleware: Erro ao verificar token:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado.' });
    }
    return res.status(403).json({ message: 'Token inválido.' });
  }
};