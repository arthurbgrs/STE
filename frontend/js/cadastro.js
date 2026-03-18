document.getElementById('formCadastro').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const senha = document.getElementById('senha').value.trim();
  const confirmarSenha = document.getElementById('confirmarSenha').value.trim();

  if (senha !== confirmarSenha) {
    document.getElementById('mensagem').textContent = 'As senhas não coincidem';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/usuarios/cadastro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, email, senha })
    });

    if (response.ok) {
      alert('Usuário cadastrado com sucesso!');
      window.location.href = 'login.html';
    } else {
      const error = await response.json();
      document.getElementById('mensagem').textContent = error.mensagem || 'Erro no cadastro';
    }
  } catch (error) {
    console.error('Erro:', error);
    document.getElementById('mensagem').textContent = 'Erro ao conectar ao servidor';
  }
});