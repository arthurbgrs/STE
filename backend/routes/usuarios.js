const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/login", (req, res) => {
  const email = (req.body.email || "").toString().trim().toLowerCase();
  const senha = (req.body.senha || "").toString().trim();
  console.log("Tentativa de login:", { email, senha });

  const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";

  db.query(sql, [email, senha], (err, result) => {
    if (err) {
      console.error("Erro na query:", err);
      return res.status(500).json(err);
    }

    console.log("Resultado da query:", result);

    if (result.length === 0) {
      return res.status(401).json({ mensagem: "Usuário inválido" });
    }

    res.json(result[0]);
  });
});

router.post("/cadastro", (req, res) => {
  try {
    console.log("Corpo da requisição:", JSON.stringify(req.body, null, 2));  // Log detalhado
const nome = (req.body.nome || "").toString().trim();
  const email = (req.body.email || "").toString().trim().toLowerCase();
  const senha = (req.body.senha || "").toString().trim();

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
