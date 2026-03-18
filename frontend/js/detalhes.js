function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function carregarDetalhes() {
  const id = getQueryParam('id');
  if (!id) {
    alert('ID do funcionário não informado');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/funcionarios/${id}`);
    if (!res.ok) {
      throw new Error(`Falha ao carregar funcionário: ${res.status}`);
    }

    const funcionario = await res.json();
    preencherDados(funcionario);
  } catch (err) {
    console.error('Erro ao carregar detalhes:', err);
    alert('Não foi possível carregar os detalhes do funcionário.');
  }
}

function preencherDados(funcionario) {
  const fotoEl = document.getElementById('fotoFuncionario');
  const nomeEl = document.getElementById('nomeFuncionario');
  const cpfEl = document.getElementById('cpfFuncionario');
  const telefoneEl = document.getElementById('telefoneFuncionario');
  const emailEl = document.getElementById('emailFuncionario');
  const cargoEl = document.getElementById('cargoFuncionario');
  const departamentoEl = document.getElementById('departamentoFuncionario');
  const detalhesEl = document.getElementById('detalhesFuncionario');

  const fotoPath = funcionario.foto || '';
  fotoEl.src = fotoPath.startsWith('/') ? `http://localhost:3000${fotoPath}` : (fotoPath || fotoEl.src);
  nomeEl.textContent = funcionario.nome || '—';
  cpfEl.textContent = `CPF: ${funcionario.cpf || '—'}`;
  telefoneEl.textContent = `📞 ${funcionario.telefone || '—'}`;
  emailEl.textContent = `✉ ${funcionario.email || '—'}`;
  cargoEl.textContent = `Cargo: ${funcionario.cargo || '—'}`;
  departamentoEl.textContent = `Departamento: ${funcionario.departamento || '—'}`;
  detalhesEl.value = funcionario.detalhes || '';
}

carregarDetalhes();