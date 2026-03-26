const container = document.getElementById('cardsContainer');
const buscaInput = document.getElementById('buscaFuncionario');
let funcionariosCarregados = [];

function funcionarioEstaAtivo(funcionario) {
  return funcionario.ativo !== 0 && funcionario.ativo !== false;
}

async function carregarFuncionarios() {
  try {
    const res = await fetch('http://localhost:3000/funcionarios');
    if (!res.ok) throw new Error('Falha ao carregar funcionários');

    const funcionarios = await res.json();
    funcionariosCarregados = funcionarios;
    atualizarLista();
  } catch (err) {
    console.error('Erro ao carregar funcionários:', err);
    container.innerHTML = '<p>Não foi possível carregar os funcionários.</p>';
  }
}

function renderFuncionarios(funcionarios) {
  const ativos = funcionarios.filter(funcionarioEstaAtivo);

  if (!ativos.length) {
    container.innerHTML = '<p>Nenhum funcionário ativo cadastrado.</p>';
    return;
  }

  container.innerHTML = '';

  ativos.forEach((funcionario) => {
    const card = document.createElement('article');
    card.className = 'card';

    const foto = document.createElement('div');
    foto.className = 'foto';

    const fotoPath = funcionario.foto || '';
    if (fotoPath) {
      const img = document.createElement('img');
      img.src = fotoPath.startsWith('/') ? `http://localhost:3000${fotoPath}` : fotoPath;
      img.alt = funcionario.nome || 'Funcionário';
      foto.appendChild(img);
    } else {
      const icone = document.createElement('i');
      icone.className = 'fa-regular fa-user';
      foto.appendChild(icone);
    }

    const nome = document.createElement('h3');
    nome.textContent = funcionario.nome || 'Funcionário';

    const cargo = document.createElement('p');
    cargo.className = 'cargo';
    cargo.textContent = funcionario.cargo || '-';

    const matricula = document.createElement('p');
    matricula.className = 'matricula';
    matricula.textContent = `Matricula: ${funcionario.id}`;

    const acoes = document.createElement('div');
    acoes.className = 'acoes';

    const btnDetalhes = document.createElement('button');
    btnDetalhes.type = 'button';
    btnDetalhes.className = 'detalhes';
    btnDetalhes.innerHTML = '<i class="fa-regular fa-eye"></i><span>Detalhes</span>';
    btnDetalhes.addEventListener('click', () => {
      window.location.href = `detalhes.html?id=${funcionario.id}`;
    });

    const btnTreino = document.createElement('button');
    btnTreino.type = 'button';
    btnTreino.className = 'treino';
    btnTreino.innerHTML = '<i class="fa-solid fa-graduation-cap"></i><span>Treinos</span>';
    btnTreino.addEventListener('click', () => {
      window.location.href = `/frontend/pages/atribuidosTreinamentos.html?id=${funcionario.id}`;
    });

    acoes.append(btnDetalhes, btnTreino);
    card.append(foto, nome, cargo, matricula, acoes);
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
