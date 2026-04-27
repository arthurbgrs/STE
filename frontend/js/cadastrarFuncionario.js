const form = document.getElementById('formCadastrarFuncionario');
const cpfInput = document.getElementById('cpf');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const telefoneInput = document.getElementById('telefone');
const cancelarCadastroBtn = document.getElementById('cancelarCadastro');

function formatarCpf(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);
  const grupos = [];

  if (numeros.length > 0) grupos.push(numeros.slice(0, 3));
  if (numeros.length > 3) grupos.push(numeros.slice(3, 6));
  if (numeros.length > 6) grupos.push(numeros.slice(6, 9));
  if (numeros.length > 9) grupos.push(numeros.slice(9, 11));

  return grupos.join('-');
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

cpfInput.addEventListener('input', () => {
  cpfInput.value = formatarCpf(cpfInput.value);
});

telefoneInput.addEventListener('input', () => {
  telefoneInput.value = telefoneInput.value.replace(/\D/g, '').slice(0, 11);
});

cancelarCadastroBtn?.addEventListener('click', () => {
  window.location.href = 'gerenciarFuncionario.html';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const cpf = cpfInput.value;
  const cpfNumeros = cpf.replace(/\D/g, '');
  const departamento = document.getElementById('departamento').value;
  const cargo = document.getElementById('cargo').value;
  const telefone = document.getElementById('telefone').value;
  const email = emailInput.value.trim().toLowerCase();
  const senha = senhaInput.value.trim();
  const detalhes = document.getElementById('detalhes').value;

  if (cpfNumeros.length !== 11) {
    alert('O CPF deve conter 11 números.');
    cpfInput.focus();
    return;
  }

  if (!emailValido(email)) {
    alert('Informe um e-mail válido.');
    emailInput.focus();
    return;
  }

  if (senha.length < 4) {
    alert('A senha deve ter pelo menos 4 caracteres.');
    senhaInput.focus();
    return;
  }

  try {
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('cpf', cpf);
    formData.append('departamento', departamento);
    formData.append('cargo', cargo);
    formData.append('telefone', telefone);
    formData.append('email', email);
    formData.append('senha', senha);
    formData.append('detalhes', detalhes);

    const fotoInput = document.getElementById('foto');
    if (fotoInput && fotoInput.files && fotoInput.files[0]) {
      formData.append('foto', fotoInput.files[0]);
    }

    const response = await fetch('http://localhost:3000/funcionarios', {
      method: 'POST',
      body: formData,
    });

    console.log('Resposta do servidor:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { mensagem: errorText };
      }

      const mensagem =
        errorData.mensagem || errorData.sqlMessage || errorData.code || errorText;
      console.error('Erro no cadastro (backend):', errorData);
      alert(`Erro ao cadastrar funcionário: ${mensagem}`);
      return;
    }

    const result = await response.json();
    alert('Funcionário cadastrado com sucesso!');
    window.location.href = `detalhes.html?id=${result.id}`;
  } catch (error) {
    console.error('Erro ao cadastrar funcionário:', error);
    alert('Erro de comunicação com o servidor');
  }
});
