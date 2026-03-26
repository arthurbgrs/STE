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

function obterIniciais(nome = '') {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() || '')
    .join('');
}

function atualizarPerfil(funcionario) {
  const nomeEl = document.getElementById('funcionarioNome');
  const departamentoEl = document.getElementById('funcionarioDepartamento');
  const fotoEl = document.getElementById('funcionarioFoto');
  const fotoPlaceholderEl = document.getElementById('fotoPlaceholder');

  nomeEl.textContent = funcionario.nome || 'Funcionário';
  departamentoEl.textContent = funcionario.departamento || 'Departamento não informado';

  const fotoFuncionario = funcionario.foto || '';
  if (fotoFuncionario) {
    fotoEl.src = fotoFuncionario.startsWith('/') ? `http://localhost:3000${fotoFuncionario}` : fotoFuncionario;
    fotoEl.style.display = 'block';
    fotoPlaceholderEl.style.display = 'none';
  } else {
    fotoEl.removeAttribute('src');
    fotoEl.style.display = 'none';
    fotoPlaceholderEl.textContent = obterIniciais(funcionario.nome || 'F');
    fotoPlaceholderEl.style.display = 'block';
  }
}

function atualizarResumo(rows) {
  const vencidos = rows.filter((item) => getStatus(item.data_vencimento) === 'Vencido').length;
  const pendentes = rows.filter((item) => getStatus(item.data_vencimento) === 'Pendente').length;

  document.getElementById('totalVencidos').textContent = String(vencidos);
  document.getElementById('totalPendentes').textContent = String(pendentes);
  document.getElementById('resumoTreinamentos').textContent = `${rows.length} treinamentos`;
}

function render(rows) {
  const tbody = document.getElementById('treinamentosBody');
  tbody.innerHTML = '';

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">Nenhum treinamento encontrado.</td></tr>';
    document.getElementById('resumoTreinamentos').textContent = '0 treinamentos';
    return;
  }

  rows.forEach((item) => {
    const tr = document.createElement('tr');
    const status = getStatus(item.data_vencimento);
    const statusClass = status.toLowerCase();

    const tdNome = document.createElement('td');
    const nomeWrap = document.createElement('div');
    nomeWrap.className = 'treinamento-celula';

    const icone = document.createElement('span');
    icone.className = `treinamento-icone ${statusClass}`;
    icone.textContent = '◫';

    const nome = document.createElement('span');
    nome.textContent = item.treinamento_nome || '-';

    nomeWrap.append(icone, nome);
    tdNome.appendChild(nomeWrap);

    const tdStatus = document.createElement('td');
    const spanStatus = document.createElement('span');
    spanStatus.className = `treinamento-status ${statusClass}`;
    spanStatus.textContent = status.toUpperCase();
    tdStatus.appendChild(spanStatus);

    const tdVencimento = document.createElement('td');
    tdVencimento.textContent = formatDate(item.data_vencimento);

    tr.append(tdNome, tdStatus, tdVencimento);
    tbody.appendChild(tr);
  });
}

async function carregarTreinamentosAtribuidos() {
  const funcionarioId = getQueryParam('id');
  const searchInput = document.getElementById('searchInput');

  if (!funcionarioId) {
    alert('Funcionário não informado na URL.');
    return;
  }

  try {
    const funcionarioRes = await fetch(`http://localhost:3000/funcionarios/${funcionarioId}`);
    if (funcionarioRes.ok) {
      const funcionario = await funcionarioRes.json();
      atualizarPerfil(funcionario);
    }

    const res = await fetch(`http://localhost:3000/treinamentos/atribuidos?funcionario_id=${funcionarioId}`);
    if (!res.ok) {
      throw new Error(`Erro ao buscar treinamentos: ${res.status}`);
    }

    const dados = await res.json();
    atualizarResumo(dados);
    render(dados);

    searchInput?.addEventListener('input', () => {
      const termo = searchInput.value.toLowerCase().trim();
      const filtrado = dados.filter((item) =>
        (item.treinamento_nome || '').toLowerCase().includes(termo) ||
        (item.categoria || '').toLowerCase().includes(termo)
      );

      render(filtrado);
      document.getElementById('resumoTreinamentos').textContent = `${filtrado.length} treinamentos`;
    });
  } catch (err) {
    console.error(err);
    document.getElementById('treinamentosBody').innerHTML = '<tr><td colspan="3">Erro ao carregar os treinamentos.</td></tr>';
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
