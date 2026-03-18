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
