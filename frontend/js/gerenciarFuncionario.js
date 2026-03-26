const container = document.getElementById('cardsContainer');
const buscaInput = document.getElementById('buscaFuncionario');
let funcionariosCarregados = [];

function funcionarioEstaAtivo(funcionario) {
  return funcionario.ativo !== 0 && funcionario.ativo !== false;
}

async function carregarFuncionarios() {
  console.log('Carregando funcionários...');
  try {
    const res = await fetch('http://localhost:3000/funcionarios');
    if (!res.ok) throw new Error('Falha ao carregar funcionários');

    const funcionarios = await res.json();
    console.log('Funcionários carregados:', funcionarios);
    funcionariosCarregados = funcionarios;
    atualizarLista();
  } catch (err) {
    console.error('Erro ao carregar funcionários:', err);
    container.innerHTML = '<p>Não foi possível carregar os funcionários.</p>';
  }
}

function renderFuncionarios(funcionarios) {
  // Filtrar apenas funcionários ativos
  const ativos = funcionarios.filter(funcionarioEstaAtivo);

  if (!ativos || ativos.length === 0) {
    container.innerHTML = '<p>Nenhum funcionário ativo cadastrado.</p>';
    return;
  }

  container.innerHTML = '';

  ativos.forEach((funcionario) => {
    const card = document.createElement('div');
    card.className = 'card';

    const foto = document.createElement('div');
    foto.className = 'foto';

    const img = document.createElement('img');
    const fotoPath = funcionario.foto || '';
    img.src = fotoPath.startsWith('/') ? `http://localhost:3000${fotoPath}` : (fotoPath || 'https://cdn-icons-png.flaticon.com/512/149/149071.png');
    img.alt = funcionario.nome;

    foto.appendChild(img);

    const nomeP = document.createElement('p');
    nomeP.innerHTML = `<b>Nome:</b> ${funcionario.nome}`;

    const cargoP = document.createElement('p');
    cargoP.innerHTML = `<b>Cargo:</b> ${funcionario.cargo || '-'}`;

    const idP = document.createElement('p');
    idP.innerHTML = `<b>Matrícula:</b> ${funcionario.id}`;

    const acoes = document.createElement('div');
    acoes.className = 'acoes';

    const btnDetalhes = document.createElement('button');
    btnDetalhes.className = 'detalhes';
    btnDetalhes.textContent = 'Ver detalhes';
    btnDetalhes.addEventListener('click', () => {
      window.location.href = `detalhes.html?id=${funcionario.id}`;
    });

    const btnTreino = document.createElement('button');
    btnTreino.className = 'treino';
    btnTreino.textContent = 'Treinamentos';
    btnTreino.addEventListener('click', () => {
      window.location.href = `/frontend/pages/atribuidosTreinamentos.html?id=${funcionario.id}`;
    });

    acoes.append(btnDetalhes, btnTreino);

    card.append(foto, nomeP, cargoP, idP, acoes);
    container.appendChild(card);
  });
}

function atualizarLista() {
  const termo = (buscaInput?.value || '').trim().toLowerCase();

  if (!termo) {
    renderFuncionarios(funcionariosCarregados);
    return;
  }

  const ordenados = [...funcionariosCarregados].sort((a, b) => {
    const nomeA = (a.nome || '').toLowerCase();
    const nomeB = (b.nome || '').toLowerCase();
    const comecaA = nomeA.startsWith(termo);
    const comecaB = nomeB.startsWith(termo);
    const incluiA = nomeA.includes(termo);
    const incluiB = nomeB.includes(termo);

    if (comecaA !== comecaB) return comecaA ? -1 : 1;
    if (incluiA !== incluiB) return incluiA ? -1 : 1;

    return nomeA.localeCompare(nomeB, 'pt-BR');
  });

  renderFuncionarios(ordenados);
}

buscaInput?.addEventListener('input', atualizarLista);

carregarFuncionarios();
