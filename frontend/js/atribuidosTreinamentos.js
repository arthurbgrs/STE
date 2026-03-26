function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('pt-BR');
}

function getStatus(dataVencimento) {
  if (!dataVencimento) return 'Desconhecido';

  const vencimento = new Date(dataVencimento);
  if (Number.isNaN(vencimento.getTime())) return 'Desconhecido';

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (vencimento < hoje) return 'Vencido';
  return 'Pendente';
}

async function carregarTreinamentosAtribuidos() {
  const funcionarioId = getQueryParam('id');
  const nomeEl = document.getElementById('funcionarioNome');
  const fotoEl = document.getElementById('funcionarioFoto');
  const fotoPlaceholderEl = document.getElementById('fotoPlaceholder');
  const tbody = document.getElementById('treinamentosBody');
  const searchInput = document.getElementById('searchInput');

  if (!funcionarioId) {
    alert('Funcionário não informado na URL.');
    return;
  }

  try {
    try {
      const funcionarioRes = await fetch(`http://localhost:3000/funcionarios/${funcionarioId}`);

      if (funcionarioRes.ok) {
        const funcionario = await funcionarioRes.json();
        const nomeFuncionario = funcionario.nome || 'Funcionário';
        const fotoFuncionario = funcionario.foto || '';

        nomeEl.textContent = nomeFuncionario;

        if (fotoFuncionario && fotoEl) {
          fotoEl.src = fotoFuncionario.startsWith('/') ? `http://localhost:3000${fotoFuncionario}` : fotoFuncionario;
          fotoEl.style.display = 'block';
          if (fotoPlaceholderEl) fotoPlaceholderEl.style.display = 'none';
        } else if (fotoEl) {
          fotoEl.removeAttribute('src');
          fotoEl.style.display = 'none';
          if (fotoPlaceholderEl) fotoPlaceholderEl.style.display = 'block';
        }
      }
    } catch (erroFuncionario) {
      console.error('Erro ao carregar dados do funcionário:', erroFuncionario);
    }

    const res = await fetch(`http://localhost:3000/treinamentos/atribuidos?funcionario_id=${funcionarioId}`);
    if (!res.ok) {
      throw new Error(`Erro ao buscar treinamentos: ${res.status}`);
    }

    const dados = await res.json();
    if (!Array.isArray(dados) || dados.length === 0) {
      nomeEl.textContent = 'Nenhum treinamento atribuído';
      tbody.innerHTML = '<tr><td colspan="3">Nenhum treinamento atribuído encontrado.</td></tr>';
      return;
    }

    const nomeFuncionario = dados[0].funcionario_nome || 'Funcionário';
    const fotoFuncionario = dados[0].funcionario_foto || '';
    if (!nomeEl.textContent || nomeEl.textContent === 'Funcionario') {
      nomeEl.textContent = nomeFuncionario;
    }

    if ((!fotoEl?.src || fotoEl.src.endsWith('/')) && fotoFuncionario && fotoEl) {
      fotoEl.src = fotoFuncionario.startsWith('/') ? `http://localhost:3000${fotoFuncionario}` : fotoFuncionario;
      fotoEl.style.display = 'block';
      if (fotoPlaceholderEl) fotoPlaceholderEl.style.display = 'none';
    }

    function render(rows) {
      tbody.innerHTML = '';

      if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">Nenhum treinamento encontrado.</td></tr>';
        return;
      }

      rows.forEach(item => {
        const tr = document.createElement('tr');

        const tdNome = document.createElement('td');
        tdNome.textContent = item.treinamento_nome || '-';

        const tdStatus = document.createElement('td');
        const status = getStatus(item.data_vencimento);
        const span = document.createElement('span');
        span.textContent = status;
        span.className = status.toLowerCase();
        tdStatus.appendChild(span);

        const tdVencimento = document.createElement('td');
        tdVencimento.textContent = formatDate(item.data_vencimento);

        tr.append(tdNome, tdStatus, tdVencimento);
        tbody.appendChild(tr);
      });
    }

    render(dados);

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const termo = searchInput.value.toLowerCase().trim();
        const filtrado = dados.filter(item =>
          item.treinamento_nome.toLowerCase().includes(termo) ||
          item.categoria.toLowerCase().includes(termo)
        );
        render(filtrado);
      });
    }

  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="3">Erro ao carregar os treinamentos.</td></tr>';
    nomeEl.textContent = 'Erro ao carregar funcionário';
  }
}

function init() {
  carregarTreinamentosAtribuidos();

  const botaoVoltar = document.querySelector('button.voltar');
  if (botaoVoltar) {
    botaoVoltar.addEventListener('click', () => {
      window.history.back();
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
