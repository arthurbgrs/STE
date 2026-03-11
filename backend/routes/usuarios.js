const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";

  db.query(sql, [email, senha], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(401).json({ mensagem: "Usuário inválido" });
    }

    res.json(result[0]);
  });
});

router.post("/cadastro", (req, res) => {
  try {
    console.log("Corpo da requisição:", JSON.stringify(req.body, null, 2));  // Log detalhado
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ mensagem: "Todos os campos são obrigatórios" });
    }

    const sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";

    db.query(sql, [nome, email, senha], (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({ mensagem: "Usuário cadastrado com sucesso" });
    });
  } catch (error) {
    console.error("Erro ao processar JSON:", error);
    return res.status(400).json({ mensagem: "JSON inválido enviado na requisição" });
  }
});

module.exports = router;
