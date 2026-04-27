const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const db = require("../db");
const { hashPassword } = require("../utils/passwords");

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

function formatFuncionario(row) {
  const { senha, ...funcionarioSemSenha } = row;

  return {
    ...funcionarioSemSenha,
    foto: row.foto ? (row.foto.startsWith("/uploads/") ? row.foto : `/uploads/${row.foto}`) : null,
  };
}

router.get("/", (req, res) => {
  db.query("SELECT * FROM funcionarios", (err, result) => {
    if (err) return res.status(500).json(err);
    const formatted = result.map(formatFuncionario);
    res.json(formatted);
  });
});

router.get("/email/:email", (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({ mensagem: "E-mail é obrigatório" });
  }

  db.query(
    "SELECT * FROM funcionarios WHERE LOWER(email) = ?",
    [email.toLowerCase()],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (!result[0]) return res.status(404).json({ mensagem: "Funcionário não encontrado" });

      res.json(formatFuncionario(result[0]));
    }
  );
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM funcionarios WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (!result[0]) return res.status(404).json({ mensagem: "Funcionário não encontrado" });

    res.json(formatFuncionario(result[0]));
  });
});

router.post("/", upload.single("foto"), async (req, res) => {
  console.log("Dados recebidos:", req.body);
  console.log("Arquivo:", req.file);
  const { nome, cpf, departamento, cargo, telefone, email, senha, detalhes } = req.body;
  const foto = req.file ? `/uploads/${req.file.filename}` : null;

  if (!nome || !cpf || !departamento || !cargo || !telefone || !email || !senha) {
    return res.status(400).json({ mensagem: "Todos os campos obrigatórios devem ser preenchidos" });
  }

  try {
    const senhaHash = await hashPassword(senha);

    const insertFuncionarioSql = `
      INSERT INTO funcionarios
      (nome, cpf, departamento, cargo, telefone, email, detalhes, foto, ativo, senha)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertFuncionarioSql,
      [nome, cpf, departamento, cargo, telefone, email, detalhes, foto, 1, senhaHash],
      (err, result) => {
        if (err) {
          console.error("Erro no banco:", err);
          return res.status(500).json(err);
        }

        const funcionarioId = result.insertId;
        const insertUsuarioSql = 'INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, "funcionario")';
        db.query(insertUsuarioSql, [nome, email, senhaHash], (errUsuario) => {
          if (errUsuario) {
            console.error("Erro ao criar usuário de login do funcionário:", errUsuario);
            db.query("DELETE FROM funcionarios WHERE id = ?", [funcionarioId], () => {
              return res.status(500).json(errUsuario);
            });
            return;
          }

          res.json({ mensagem: "Funcionário criado", id: funcionarioId });
        });
      }
    );
  } catch (hashErr) {
    console.error("Erro ao criptografar senha do funcionário:", hashErr);
    return res.status(500).json(hashErr);
  }
});

router.put("/:id", upload.single("foto"), (req, res) => {
  const { id } = req.params;
  const { nome, cpf, departamento, cargo, telefone, email, detalhes } = req.body;
  const foto = req.file ? `/uploads/${req.file.filename}` : null;

  console.log("PUT /funcionarios/" + id, { body: req.body, file: req.file });

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
      console.error("Erro no banco ao atualizar:", err);
      return res.status(500).json({ mensagem: err.sqlMessage || err.message || "Erro ao atualizar funcionário" });
    }
    res.json({ mensagem: "Funcionário atualizado" });
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.beginTransaction((transactionErr) => {
    if (transactionErr) {
      return res.status(500).json(transactionErr);
    }

    db.query("SELECT email FROM funcionarios WHERE id = ?", [id], (selectErr, rows) => {
      if (selectErr) {
        return db.rollback(() => res.status(500).json(selectErr));
      }

      const funcionario = rows?.[0];
      if (!funcionario) {
        return db.rollback(() => {
          res.status(404).json({ mensagem: "Funcionário não encontrado" });
        });
      }

      db.query("DELETE FROM funcionarios WHERE id = ?", [id], (deleteFuncionarioErr) => {
        if (deleteFuncionarioErr) {
          return db.rollback(() => res.status(500).json(deleteFuncionarioErr));
        }

        db.query(
          "DELETE FROM usuarios WHERE LOWER(email) = ?",
          [String(funcionario.email || "").toLowerCase()],
          (deleteUsuarioErr) => {
            if (deleteUsuarioErr) {
              return db.rollback(() => res.status(500).json(deleteUsuarioErr));
            }

            db.commit((commitErr) => {
              if (commitErr) {
                return db.rollback(() => res.status(500).json(commitErr));
              }

              res.json({ mensagem: "Funcionário removido" });
            });
          }
        );
      });
    });
  });
});

module.exports = router;
