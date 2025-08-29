const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'devsocial_user',     
  password: 'devsocial123',  
  database: 'devsocial'
};

const pool = mysql.createPool(dbConfig);

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