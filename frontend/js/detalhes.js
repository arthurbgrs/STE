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
    console.log('Detalhes recebidos:', funcionario);
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

  const btnEditar = document.getElementById('editarFuncionario');
  if (btnEditar) {
    btnEditar.addEventListener('click', () => {
      const id = getQueryParam('id');
      if (!id) return;
      window.location.href = `editar-f.html?id=${id}`;
    });
  }
  const btnExcluir = document.getElementById('excluirFuncionario');
if (btnExcluir) {
  btnExcluir.addEventListener('click', async () => {
    const id = getQueryParam('id');
    if (!id) return;

    const confirmar = confirm('Tem certeza de que deseja excluir este funcionário? Esta ação não pode ser desfeita.');
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:3000/funcionarios/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert(`Erro ao excluir funcionário (${res.status}): ${errorText}`);
        return;
      }

      alert('Funcionário excluído com sucesso!');
      window.location.href = 'gerenciarFuncionario.html';
    } catch (err) {
      console.error('Erro ao excluir funcionário:', err);
      alert('Erro de comunicação ao excluir funcionário.');
    }
  });
}
}

carregarDetalhes();