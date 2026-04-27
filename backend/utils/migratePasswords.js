const db = require("../db");
const { hashPassword, isBcryptHash } = require("./passwords");

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function migrateTablePasswords(tableName) {
  const rows = await query(`SELECT id, senha FROM ${tableName}`);
  let updated = 0;

  for (const row of rows) {
    if (!isBcryptHash(row.senha)) {
      const hash = await hashPassword(row.senha);
      await query(`UPDATE ${tableName} SET senha = ? WHERE id = ?`, [hash, row.id]);
      updated += 1;
    }
  }

  return updated;
}

async function migratePlaintextPasswords() {
  const updatedUsuarios = await migrateTablePasswords("usuarios");
  const updatedFuncionarios = await migrateTablePasswords("funcionarios");

  return {
    usuarios: updatedUsuarios,
    funcionarios: updatedFuncionarios,
  };
}

module.exports = {
  migratePlaintextPasswords,
};
