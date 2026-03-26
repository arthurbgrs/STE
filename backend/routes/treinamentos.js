const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  db.query("SELECT * FROM treinamentos", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.post("/", (req, res) => {
  const { nome, validade, carga_horaria, categoria, detalhes } = req.body;

  const sql = `
        INSERT INTO treinamentos
        (nome, validade, carga_horaria, categoria, detalhes)
        VALUES (?, ?, ?, ?, ?)
    `;

  db.query(
    sql,
    [nome, validade, carga_horaria, categoria, detalhes],
    (err, result) => {
      if (err) return res.status(500).json(err);

      const insertId = result?.insertId;
      if (insertId) {
        return res.json({ mensagem: "Treinamento criado", id: insertId });
      }

      // Fallback: pegar o último ID inserido (caso o driver não o retorne)
      db.query("SELECT LAST_INSERT_ID() AS id", (err2, rows) => {
        if (err2) return res.status(500).json(err2);
        const lastId = rows?.[0]?.id;
        res.json({ mensagem: "Treinamento criado", id: lastId });
      });
    }
  );
});
router.get('/atribuidos', (req, res) => {
    const funcionario_id = req.query.funcionario_id;

    if (!funcionario_id) {
        return res.status(400).json({ mensagem: 'O parâmetro funcionario_id é obrigatório' });
    }

    const sql = `
        SELECT ft.id AS atribuido_id,
               ft.data_vencimento,
               t.id AS treinamento_id,
               t.nome AS treinamento_nome,
               t.categoria,
               t.carga_horaria,
               t.validade AS validade_treinamento,
               t.detalhes AS detalhes_treinamento,
               f.nome AS funcionario_nome,
               f.foto AS funcionario_foto
        FROM funcionario_treinamentos ft
        JOIN treinamentos t ON ft.treinamento_id = t.id
        JOIN funcionarios f ON ft.funcionario_id = f.id
        WHERE ft.funcionario_id = ?
        ORDER BY ft.data_vencimento ASC
    `;

    db.query(sql, [funcionario_id], (err, result) => {
        if (err) return res.status(500).json(err);
        const formatted = result.map((row) => ({
            ...row,
            funcionario_foto: row.funcionario_foto
                ? (row.funcionario_foto.startsWith('/uploads/') ? row.funcionario_foto : `/uploads/${row.funcionario_foto}`)
                : null,
        }));
        res.json(formatted);
    });
});

router.post('/atribuir', (req, res) => {

    const { funcionario_id, treinamento_id, data_vencimento } = req.body;

    const sql = `
        INSERT INTO funcionario_treinamentos
        (funcionario_id, treinamento_id, data_vencimento)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [funcionario_id, treinamento_id, data_vencimento],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ mensagem: "Treinamento atribuído" });
        }
    );

});

module.exports = router;
