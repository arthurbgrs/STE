const API_BASE = "http://localhost:3000";

function showMessage(text, type = "info") {
  const messageEl = document.getElementById("message");
  if (!messageEl) return;

  messageEl.textContent = text;
  messageEl.className = type;
}

async function carregarFuncionarios() {
  const select = document.getElementById("funcionarioSelect");
  if (!select) return;

  select.innerHTML = '<option value="">Carregando...</option>';

  try {
    const res = await fetch(`${API_BASE}/funcionarios`);
    if (!res.ok) throw new Error("Falha ao carregar funcionários");

    const funcionarios = await res.json();
    select.innerHTML = '<option value="">Selecione um funcionário</option>';

    if (!Array.isArray(funcionarios) || funcionarios.length === 0) {
      select.innerHTML = '<option value="">Nenhum funcionário encontrado</option>';
      return;
    }

    funcionarios.forEach((funcionario) => {
      const option = document.createElement("option");
      option.value = funcionario.id;
      option.textContent = `${funcionario.nome} (matrícula ${funcionario.id})`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    select.innerHTML = '<option value="">Erro ao carregar funcionários</option>';
    showMessage("Não foi possível carregar a lista de funcionários.", "error");
  }
}

async function criarTreinamento(event) {
  event.preventDefault();

  const funcionarioId = document.getElementById("funcionarioSelect")?.value;
  const nome = document.getElementById("treinamentoNome")?.value.trim();
  const categoria = document.getElementById("categoria")?.value.trim();
  const cargaHoraria = document.getElementById("cargaHoraria")?.value;
  const validade = document.getElementById("validade")?.value;
  const detalhes = document.getElementById("detalhes")?.value.trim();

  if (!funcionarioId) {
    showMessage("Escolha um funcionário para vincular o treinamento.", "error");
    return;
  }

  if (!nome) {
    showMessage("Informe o nome do treinamento.", "error");
    return;
  }

  if (!categoria) {
    showMessage("Informe a categoria do treinamento.", "error");
    return;
  }

  if (!cargaHoraria) {
    showMessage("Informe a carga horária do treinamento.", "error");
    return;
  }

  if (!validade) {
    showMessage("Informe a validade do treinamento.", "error");
    return;
  }

  showMessage("Salvando treinamento...", "info");

  try {
    const treinoRes = await fetch(`${API_BASE}/treinamentos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        validade,
        carga_horaria: cargaHoraria,
        categoria,
        detalhes,
      }),
    });

    if (!treinoRes.ok) {
      const err = await treinoRes.text();
      throw new Error(err || "Falha ao criar o treinamento.");
    }

    const treinoData = await treinoRes.json();
    const treinamentoId = treinoData?.id;

    if (!treinamentoId) {
      console.error('Resposta do servidor (treinamentos):', treinoData);
      throw new Error(
        "Não foi possível obter o ID do treinamento criado. Verifique se o servidor está retornando o campo 'id'."
      );
    }

    const atribuirRes = await fetch(`${API_BASE}/treinamentos/atribuir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        funcionario_id: funcionarioId,
        treinamento_id: treinamentoId,
        data_vencimento: validade,
      }),
    });

    if (!atribuirRes.ok) {
      const err = await atribuirRes.text();
      throw new Error(err || "Falha ao vincular o treinamento ao funcionário.");
    }

    showMessage("Treinamento criado e vinculado com sucesso!", "success");
    document.getElementById("addTrainingForm")?.reset();
  } catch (error) {
    console.error(error);
    showMessage(`Erro: ${error.message || error}`, "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarFuncionarios();
  const form = document.getElementById("addTrainingForm");
  form?.addEventListener("submit", criarTreinamento);
});
