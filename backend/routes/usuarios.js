const express = require("express");
const router = express.Router();
const db = require("../db");
const { comparePassword, hashPassword, isBcryptHash } = require("../utils/passwords");

function sanitizeUser(row) {
  if (!row) return row;
  const { senha, ...safeRow } = row;
  return safeRow;
}

router.post("/index", (req, res) => {
  const email = (req.body.email || "").toString().trim().toLowerCase();
  const senha = (req.body.senha || "").toString().trim();

  const sql = "SELECT * FROM usuarios WHERE LOWER(email) = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error("Erro na query:", err);
      return res.status(500).json(err);
    }

    const usuario = result?.[0];
    if (usuario) {
      try {
        const senhaCorreta = await comparePassword(senha, usuario.senha);
        if (senhaCorreta) {
          if (!isBcryptHash(usuario.senha)) {
            const senhaHash = await hashPassword(senha);
            db.query("UPDATE usuarios SET senha = ? WHERE id = ?", [senhaHash, usuario.id], (updateErr) => {
              if (updateErr) {
                console.error("Erro ao migrar senha do usuário para hash:", updateErr);
              }
            });
          }

          return res.json(sanitizeUser(usuario));
        }
      } catch (compareErr) {
        console.error("Erro ao validar senha do usuário:", compareErr);
        return res.status(500).json(compareErr);
      }
    }

    const funcionarioSql = "SELECT * FROM funcionarios WHERE LOWER(email) = ?";
    db.query(funcionarioSql, [email], async (funcErr, funcResult) => {
      if (funcErr) {
        console.error("Erro na query de funcionario:", funcErr);
        return res.status(500).json(funcErr);
      }

      const funcionario = funcResult?.[0];
      if (!funcionario) {
        return res.status(401).json({ mensagem: "Usuário inválido" });
      }

      try {
        const senhaCorreta = await comparePassword(senha, funcionario.senha);
        if (!senhaCorreta) {
          return res.status(401).json({ mensagem: "Usuário inválido" });
        }

        const senhaHash = isBcryptHash(funcionario.senha)
          ? funcionario.senha
          : await hashPassword(senha);

        if (!isBcryptHash(funcionario.senha)) {
          db.query("UPDATE funcionarios SET senha = ? WHERE id = ?", [senhaHash, funcionario.id], (updateFuncErr) => {
            if (updateFuncErr) {
              console.error("Erro ao migrar senha do funcionário para hash:", updateFuncErr);
            }
          });
        }

        const insertUsuarioSql = "INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, 'funcionario')";
        db.query(insertUsuarioSql, [funcionario.nome, funcionario.email, senhaHash], (insertErr, insertResult) => {
          if (insertErr) {
            console.error("Erro ao criar usuário fallback:", insertErr);
            return res.status(500).json(insertErr);
          }

          db.query("SELECT * FROM usuarios WHERE id = ?", [insertResult.insertId], (newErr, newResult) => {
            if (newErr) {
              console.error("Erro ao buscar usuário criado:", newErr);
              return res.status(500).json(newErr);
            }

            return res.json(sanitizeUser(newResult[0]));
          });
        });
      } catch (hashErr) {
        console.error("Erro ao validar/migrar senha do funcionário:", hashErr);
        return res.status(500).json(hashErr);
      }
    });
  });
});

router.put("/alterar-senha", (req, res) => {
  const email = (req.body.email || "").toString().trim().toLowerCase();
  const senhaAtual = (req.body.senhaAtual || "").toString().trim();
  const novaSenha = (req.body.novaSenha || "").toString().trim();

  if (!email || !senhaAtual || !novaSenha) {
    return res.status(400).json({ mensagem: "Email, senha atual e nova senha são obrigatórios" });
  }

  const selectSql = "SELECT * FROM usuarios WHERE email = ?";
  db.query(selectSql, [email], async (err, result) => {
    if (err) {
      console.error("Erro na query de verificação de senha:", err);
      return res.status(500).json(err);
    }

    const usuario = result?.[0];
    if (!usuario) {
      return res.status(401).json({ mensagem: "Email ou senha atual inválidos" });
    }

    try {
      const senhaCorreta = await comparePassword(senhaAtual, usuario.senha);
      if (!senhaCorreta) {
        return res.status(401).json({ mensagem: "Email ou senha atual inválidos" });
      }

      const novaSenhaHash = await hashPassword(novaSenha);

      db.query("UPDATE usuarios SET senha = ? WHERE id = ?", [novaSenhaHash, usuario.id], (updateErr) => {
        if (updateErr) {
          console.error("Erro ao atualizar senha:", updateErr);
          return res.status(500).json(updateErr);
        }

        db.query("UPDATE funcionarios SET senha = ? WHERE LOWER(email) = ?", [novaSenhaHash, email], (funcErr) => {
          if (funcErr) {
            console.error("Erro ao sincronizar senha do funcionário:", funcErr);
            return res.status(500).json(funcErr);
          }

          res.json({ mensagem: "Senha atualizada com sucesso" });
        });
      });
    } catch (compareErr) {
      console.error("Erro ao validar/criptografar senha:", compareErr);
      return res.status(500).json(compareErr);
    }
  });
});

router.post("/cadastro", async (req, res) => {
  try {
    const nome = (req.body.nome || "").toString().trim();
    const email = (req.body.email || "").toString().trim().toLowerCase();
    const senha = (req.body.senha || "").toString().trim();

    if (!nome || !email || !senha) {
      return res.status(400).json({ mensagem: "Todos os campos são obrigatórios" });
    }

    const senhaHash = await hashPassword(senha);
    const sql = "INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, 'funcionario')";

    db.query(sql, [nome, email, senhaHash], (err) => {
      if (err) return res.status(500).json(err);

      res.json({ mensagem: "Usuário cadastrado com sucesso" });
    });
  } catch (error) {
    console.error("Erro ao processar JSON:", error);
    return res.status(400).json({ mensagem: "JSON inválido enviado na requisição" });
  }
});

module.exports = router;
