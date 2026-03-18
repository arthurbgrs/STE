document.getElementById('formCadastro').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const response = await fetch('http://localhost:3000/usuarios/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    if (response.ok) {
      const user = await response.json();
      // Armazenar usuário logado, talvez em localStorage
      localStorage.setItem('user', JSON.stringify(user));
      // Redirecionar para página inicial
      window.location.href = 'paginainicial.html';
    } else {
      const error = await response.json();
      alert(error.mensagem || 'Erro no login');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao conectar ao servidor');
  }
});