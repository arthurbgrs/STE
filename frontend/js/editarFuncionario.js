console.log('editarFuncionario.js carregado');

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function carregarFuncionarioParaEditar() {
  const id = getQueryParam('id');
  console.log('editarFuncionario.js carregado, id=', id);
  if (!id) {
    alert('ID do funcionário não informado');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/funcionarios/${id}`);
    if (!res.ok) throw new Error(`Falha ao carregar funcionário: ${res.status}`);

    const funcionario = await res.json();
    console.log('Dados do funcionário carregados:', funcionario);
    preencherFormulario(funcionario);
  } catch (err) {
    console.error('Erro ao carregar funcionário para edição:', err);
    alert('Não foi possível carregar dados do funcionário.');
  }
}

function preencherFormulario(funcionario) {
  document.getElementById('nome').value = funcionario.nome || '';
  document.getElementById('email').value = funcionario.email || '';
  document.getElementById('departamento').value = funcionario.departamento || '';
  document.getElementById('cargo').value = funcionario.cargo || '';
  document.getElementById('cpf').value = funcionario.cpf || '';
  document.getElementById('telefone').value = funcionario.telefone || '';
  document.getElementById('detalhes').value = funcionario.detalhes || '';

  const fotoEl = document.getElementById('previewFoto');
  const fotoPath = funcionario.foto || '';
  if (fotoPath) {
    fotoEl.src = fotoPath.startsWith('/') ? `http://localhost:3000${fotoPath}` : fotoPath;
  }
}

function setupForm() {
  const form = document.getElementById('formEditarFuncionario');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = getQueryParam('id');
    if (!id) return;

    const formData = new FormData();
    formData.append('nome', document.getElementById('nome').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('departamento', document.getElementById('departamento').value);
    formData.append('cargo', document.getElementById('cargo').value);
    formData.append('cpf', document.getElementById('cpf').value);
    formData.append('telefone', document.getElementById('telefone').value);
    formData.append('detalhes', document.getElementById('detalhes').value);

    const fotoInput = document.getElementById('foto');
    if (fotoInput.files && fotoInput.files[0]) {
      formData.append('foto', fotoInput.files[0]);
    }

    try {
      const res = await fetch(`http://localhost:3000/funcionarios/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const text = await res.text();
      console.log('Resposta PUT /funcionarios/:id', res.status, text);

      if (!res.ok) {
        alert(`Erro ao salvar alterações (${res.status}): ${text}`);
        return;
      }

      alert('Alterações salvas com sucesso!');
      window.location.href = `detalhes.html?id=${id}`;
    } catch (err) {
      console.error('Erro ao salvar alterações:', err);
      alert('Erro de comunicação ao salvar');
    }
  });

  const fotoInput = document.getElementById('foto');
  const preview = document.getElementById('previewFoto');
  fotoInput.addEventListener('change', () => {
    const file = fotoInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (preview.src = reader.result);
    reader.readAsDataURL(file);
  });

  const btnCancelar = document.getElementById('cancelarEditar');
  btnCancelar.addEventListener('click', () => {
    const id = getQueryParam('id');
    if (id) {
      window.location.href = `detalhes.html?id=${id}`;
    } else {
      window.location.href = 'gerenciarFuncionario.html';
    }
  });
}

carregarFuncionarioParaEditar();
setupForm();