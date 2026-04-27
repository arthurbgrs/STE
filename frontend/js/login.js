const DEFAULT_PASSWORD = 'abc*123';
const form = document.getElementById('formCadastro');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const loginButton = document.querySelector('button[type="submit"]');
const messageElement = document.getElementById('mensagem-senha');
const passwordResetContainer = document.getElementById('passwordResetContainer');
const novaSenhaInput = document.getElementById('novaSenha');
const confirmarNovaSenhaInput = document.getElementById('confirmarNovaSenha');
const mudarSenhaButton = document.getElementById('mudarSenhaButton');
let currentUser = null;

function setMessage(text, isError = false) {
  if (!messageElement) return;
  messageElement.textContent = text;
  messageElement.style.color = isError ? '#c0392b' : '#2e1461';
}

function showPasswordResetSection() {
  if (!passwordResetContainer || !loginButton) return;
  passwordResetContainer.classList.remove('hidden');
  loginButton.classList.add('hidden');
  setMessage('Senha padrão detectada. Informe uma nova senha para continuar.');
}

function hidePasswordResetSection() {
  if (!passwordResetContainer || !loginButton) return;
  passwordResetContainer.classList.add('hidden');
  loginButton.classList.remove('hidden');
  if (novaSenhaInput) novaSenhaInput.value = '';
  if (confirmarNovaSenhaInput) confirmarNovaSenhaInput.value = '';
}

async function updateUserPassword(email, currentPassword, newPassword) {
  const response = await fetch('http://localhost:3000/usuarios/alterar-senha', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, senhaAtual: currentPassword, novaSenha: newPassword })
  });

  return response;
}

async function loginUser(email, password) {
  const response = await fetch('http://localhost:3000/usuarios/index', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, senha: password })
  });

  return response;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim().toLowerCase();
  const senha = senhaInput.value.trim();

  if (!email || !senha) {
    setMessage('Informe email e senha.', true);
    return;
  }

  try {
    const response = await loginUser(email, senha);
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.mensagem || 'Erro no login', true);
      return;
    }

    if (senha === DEFAULT_PASSWORD && payload.role === 'funcionario') {
      currentUser = payload;
      showPasswordResetSection();
      return;
    }

    delete payload.senha;
    localStorage.setItem('user', JSON.stringify(payload));
    window.location.href = 'pages/paginainicial.html';
  } catch (error) {
    console.error('Erro:', error);
    setMessage('Erro ao conectar ao servidor', true);
  }
});

mudarSenhaButton?.addEventListener('click', async () => {
  if (!currentUser) {
    setMessage('Nenhum usuário para trocar senha.', true);
    return;
  }

  const novaSenha = novaSenhaInput.value.trim();
  const confirmarNovaSenha = confirmarNovaSenhaInput.value.trim();

  if (!novaSenha || !confirmarNovaSenha) {
    setMessage('Preencha a nova senha e a confirmação.', true);
    return;
  }

  if (novaSenha !== confirmarNovaSenha) {
    setMessage('As senhas não coincidem.', true);
    return;
  }

  if (novaSenha === DEFAULT_PASSWORD) {
    setMessage('Escolha uma senha diferente da padrão.', true);
    return;
  }

  try {
    const response = await updateUserPassword(currentUser.email, DEFAULT_PASSWORD, novaSenha);
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.mensagem || 'Erro ao alterar senha.', true);
      return;
    }

    const userData = {
      id: currentUser.id,
      nome: currentUser.nome,
      email: currentUser.email,
      role: currentUser.role
    };

    localStorage.setItem('user', JSON.stringify(userData));
    window.location.href = 'pages/paginainicial.html';
  } catch (error) {
    console.error('Erro:', error);
    setMessage('Erro ao conectar ao servidor', true);
  }
});
