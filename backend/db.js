const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'treinamento_empresa'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro na conexão:', err);
        return;
    }
    console.log('Conectado ao MySQL');
});

module.exports = connection;