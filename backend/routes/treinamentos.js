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

  db.query(sql, [nome, validade, carga_horaria, categoria, detalhes], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ mensagem: "Treinamento criado" });
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
