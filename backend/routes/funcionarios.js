const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const db = require("../db");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    },
  }),
});

router.get("/", (req, res) => {
  db.query("SELECT * FROM funcionarios", (err, result) => {
    if (err) return res.status(500).json(err);
    const formatted = result.map((row) => ({
      ...row,
      foto: row.foto ? (row.foto.startsWith('/uploads/') ? row.foto : `/uploads/${row.foto}`) : null,
    }));
    res.json(formatted);
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM funcionarios WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (!result[0]) return res.status(404).json({ mensagem: 'Funcionário não encontrado' });

    const row = result[0];
    const formatted = {
      ...row,
      foto: row.foto ? (row.foto.startsWith('/uploads/') ? row.foto : `/uploads/${row.foto}`) : null,
    };

    res.json(formatted);
  });
});

router.post("/", upload.single('foto'), (req, res) => {
  console.log('Dados recebidos:', req.body);
  console.log('Arquivo:', req.file);
  const { nome, cpf, departamento, cargo, telefone, email, detalhes } = req.body;
  const foto = req.file ? `/uploads/${req.file.filename}` : null;

  if (!nome || !cpf || !departamento || !cargo || !telefone || !email) {
    return res.status(400).json({ mensagem: "Todos os campos obrigatórios devem ser preenchidos" });
  }

  const sql = `
        INSERT INTO funcionarios
        (nome, cpf, departamento, cargo, telefone, email, detalhes, foto, ativo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.query(
    sql,
    [nome, cpf, departamento, cargo, telefone, email, detalhes, foto, 1],
    (err, result) => {
      if (err) {
        console.error('Erro no banco:', err);
        return res.status(500).json(err);
      }
      res.json({ mensagem: "Funcionário criado" });
    },
  );
});

router.put("/:id", upload.single('foto'), (req, res) => {
  const { id } = req.params;
  const { nome, cpf, departamento, cargo, telefone, email, detalhes } = req.body;
  const foto = req.file ? `/uploads/${req.file.filename}` : null;

  console.log('PUT /funcionarios/' + id, { body: req.body, file: req.file });

  if (!nome || !cpf || !departamento || !cargo || !telefone || !email) {
    return res.status(400).json({ mensagem: "Todos os campos obrigatórios devem ser preenchidos" });
  }

  const fields = [
    "nome = ?",
    "cpf = ?",
    "departamento = ?",
    "cargo = ?",
    "telefone = ?",
    "email = ?",
    "detalhes = ?",
  ];

  const values = [nome, cpf, departamento, cargo, telefone, email, detalhes];

  if (foto) {
    fields.push("foto = ?");
    values.push(foto);
  }

  values.push(id);

  const sql = `
        UPDATE funcionarios
        SET ${fields.join(", ")}
        WHERE id=?
    `;

  db.query(sql, values, (err) => {
    if (err) {
      console.error('Erro no banco ao atualizar:', err);
      return res.status(500).json({ mensagem: err.sqlMessage || err.message || 'Erro ao atualizar funcionário' });
    }
    res.json({ mensagem: "Funcionário atualizado" });
  });
});


router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM funcionarios WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ mensagem: "Funcionário removido" });
  });
});

module.exports = router;
