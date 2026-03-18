async function carregarFuncionarios() {
  console.log('Carregando funcionários...');
  try {
    const res = await fetch('http://localhost:3000/funcionarios');
    if (!res.ok) throw new Error('Falha ao carregar funcionários');

    const funcionarios = await res.json();
    console.log('Funcionários carregados:', funcionarios);
    renderFuncionarios(funcionarios);
  } catch (err) {
    console.error('Erro ao carregar funcionários:', err);
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '<p>Não foi possível carregar os funcionários.</p>';
  }
}

function renderFuncionarios(funcionarios) {
  const container = document.getElementById('cardsContainer');

  if (!funcionarios || funcionarios.length === 0) {
    container.innerHTML = '<p>Nenhum funcionário cadastrado.</p>';
    return;
  }

  container.innerHTML = '';

  funcionarios.forEach((funcionario) => {
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
      alert('Funcionalidade de treinamentos ainda não implementada.');
    });

    acoes.append(btnDetalhes, btnTreino);

    card.append(foto, nomeP, cargoP, idP, acoes);
    container.appendChild(card);
  });
}

carregarFuncionarios();