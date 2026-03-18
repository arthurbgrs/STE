const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Servir uploads de fotos de funcionários
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/usuarios', require('./routes/usuarios'));
app.use('/funcionarios', require('./routes/funcionarios'));
app.use('/treinamentos', require('./routes/treinamentos'));

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});