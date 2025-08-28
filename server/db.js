const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'devsocial_user',     
  password: 'devsocial123',  
  database: 'devsocial'
};

// Cria um pool de conexões
const pool = mysql.createPool(dbConfig);

// Testa a conexão ao iniciar o pool
pool.getConnection()
  .then(connection => {
    console.log('Conectado ao MySQL com sucesso!');
    connection.release(); 
  })
  .catch(err => {
    console.error('Erro ao conectar ao MySQL:', err.message);
    process.exit(1);
  });

module.exports = pool; 