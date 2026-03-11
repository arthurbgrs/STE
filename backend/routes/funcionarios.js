const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  db.query("SELECT * FROM funcionarios", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM funcionarios WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

router.post("/", (req, res) => {
  const { nome, cpf, departamento, cargo, telefone, email, detalhes } =
    req.body;

  const sql = `
        INSERT INTO funcionarios
        (nome, cpf, departamento, cargo, telefone, email, detalhes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  db.query(
    sql,
    [nome, cpf, departamento, cargo, telefone, email, detalhes],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ mensagem: "Funcionário criado" });
    },
  );
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nome, departamento, cargo, telefone, email, detalhes } = req.body;

  const sql = `
        UPDATE funcionarios
        SET nome=?, departamento=?, cargo=?, telefone=?, email=?, detalhes=?
        WHERE id=?
    `;

  db.query(
    sql,
    [nome, departamento, cargo, telefone, email, detalhes, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ mensagem: "Funcionário atualizado" });
    },
  );
});


router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM funcionarios WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ mensagem: "Funcionário removido" });
  });
});

module.exports = router;
