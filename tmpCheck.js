const db = require('./backend/db');

db.query('SELECT * FROM funcionario_treinamentos', (err, rows) => {
  if (err) {
    console.error('erro', err);
    process.exit(1);
  }
  console.log('rows', rows);
  process.exit(0);
});