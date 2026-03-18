document.getElementById('formCadastrarFuncionario').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const cpf = document.getElementById('cpf').value;
  const departamento = document.getElementById('departamento').value;
  const cargo = document.getElementById('cargo').value;
  const telefone = document.getElementById('telefone').value;
  const email = document.getElementById('email').value;
  const detalhes = document.getElementById('detalhes').value;

  try {
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('cpf', cpf);
    formData.append('departamento', departamento);
    formData.append('cargo', cargo);
    formData.append('telefone', telefone);
    formData.append('email', email);
    formData.append('detalhes', detalhes);

    const fotoInput = document.getElementById('foto');
    if (fotoInput && fotoInput.files && fotoInput.files[0]) {
      formData.append('foto', fotoInput.files[0]);
    }

    const response = await fetch('http://localhost:3000/funcionarios', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.mensagem || 'Erro ao cadastrar funcionário');
      return;
    }

    alert('Funcionário cadastrado com sucesso!');
    window.location.href = 'gerenciarFuncionario.html';
  } catch (error) {
    console.error('Erro ao cadastrar funcionário:', error);
    alert('Erro de comunicação com o servidor');
  }
});