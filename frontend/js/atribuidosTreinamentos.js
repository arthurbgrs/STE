function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("pt-BR");
}

function getStatus(item) {
  if (item?.finalizado) return "Finalizado";
  if (!item?.data_vencimento) return "Desconhecido";

  const vencimento = new Date(item.data_vencimento);
  if (Number.isNaN(vencimento.getTime())) return "Desconhecido";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (vencimento < hoje) return "Vencido";
  return "Pendente";
}

function getStatusClass(status) {
  return status
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function obterIniciais(nome = "") {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() || "")
    .join("");
}

function atualizarPerfil(funcionario) {
  const nomeEl = document.getElementById("funcionarioNome");
  const departamentoEl = document.getElementById("funcionarioDepartamento");
  const fotoEl = document.getElementById("funcionarioFoto");
  const fotoPlaceholderEl = document.getElementById("fotoPlaceholder");

  nomeEl.textContent = funcionario.nome || "Funcionário";
  departamentoEl.textContent = funcionario.departamento || "Departamento não informado";

  const fotoFuncionario = funcionario.foto || "";
  if (fotoFuncionario) {
    fotoEl.src = fotoFuncionario.startsWith("/") ? `http://localhost:3000${fotoFuncionario}` : fotoFuncionario;
    fotoEl.style.display = "block";
    fotoPlaceholderEl.style.display = "none";
  } else {
    fotoEl.removeAttribute("src");
    fotoEl.style.display = "none";
    fotoPlaceholderEl.textContent = obterIniciais(funcionario.nome || "F");
    fotoPlaceholderEl.style.display = "block";
  }
}

function atualizarResumo(rows) {
  const vencidos = rows.filter((item) => getStatus(item) === "Vencido").length;
  const pendentes = rows.filter((item) => getStatus(item) === "Pendente").length;

  document.getElementById("totalVencidos").textContent = String(vencidos);
  document.getElementById("totalPendentes").textContent = String(pendentes);
  document.getElementById("resumoTreinamentos").textContent = `${rows.length} treinamentos`;
}

async function getFuncionarioLogado() {
  const currentUser = getCurrentUser();
  if (!currentUser?.email || currentUser.role !== "funcionario") return null;

  const email = encodeURIComponent(currentUser.email.trim().toLowerCase());
  const response = await fetch(`http://localhost:3000/funcionarios/email/${email}`);
  if (!response.ok) return null;
  return response.json();
}

function criarAcaoTreinamento(item, podeFinalizar, onFinalizar) {
  const tdAcao = document.createElement("td");
  tdAcao.className = "acao-treinamento";

  if (item.finalizado) {
    const concluido = document.createElement("span");
    concluido.className = "acao-finalizada";
    concluido.textContent = item.data_finalizacao
      ? `Finalizado em ${formatDate(item.data_finalizacao)}`
      : "Finalizado";
    tdAcao.appendChild(concluido);
    return tdAcao;
  }

  if (!podeFinalizar) {
    const semAcao = document.createElement("span");
    semAcao.className = "acao-sem-permissao";
    semAcao.textContent = "—";
    tdAcao.appendChild(semAcao);
    return tdAcao;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "botao-finalizar";
  button.textContent = "Marcar como finalizado";
  button.addEventListener("click", () => onFinalizar(item.atribuido_id, button));
  tdAcao.appendChild(button);

  return tdAcao;
}

function render(rows, podeFinalizar, onFinalizar) {
  const tbody = document.getElementById("treinamentosBody");
  tbody.innerHTML = "";

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">Nenhum treinamento encontrado.</td></tr>';
    document.getElementById("resumoTreinamentos").textContent = "0 treinamentos";
    return;
  }

  rows.forEach((item) => {
    const tr = document.createElement("tr");
    const status = getStatus(item);
    const statusClass = getStatusClass(status);

    const tdNome = document.createElement("td");
    const nomeWrap = document.createElement("div");
    nomeWrap.className = "treinamento-celula";

    const icone = document.createElement("span");
    icone.className = `treinamento-icone ${statusClass}`;
    icone.textContent = "◫";

    const nome = document.createElement("span");
    nome.textContent = item.treinamento_nome || "-";

    nomeWrap.append(icone, nome);
    tdNome.appendChild(nomeWrap);

    const tdStatus = document.createElement("td");
    const spanStatus = document.createElement("span");
    spanStatus.className = `treinamento-status ${statusClass}`;
    spanStatus.textContent = status.toUpperCase();
    tdStatus.appendChild(spanStatus);

    const tdVencimento = document.createElement("td");
    tdVencimento.textContent = formatDate(item.data_vencimento);

    const tdAcao = criarAcaoTreinamento(item, podeFinalizar, onFinalizar);

    tr.append(tdNome, tdStatus, tdVencimento, tdAcao);
    tbody.appendChild(tr);
  });
}

async function marcarComoFinalizado(atribuidoId, button) {
  button.disabled = true;
  button.textContent = "Salvando...";

  try {
    const response = await fetch(`http://localhost:3000/treinamentos/atribuidos/${atribuidoId}/finalizar`, {
      method: "PUT",
    });

    if (!response.ok) {
      throw new Error(`Erro ao finalizar treinamento: ${response.status}`);
    }

    await carregarTreinamentosAtribuidos();
  } catch (error) {
    console.error(error);
    alert("Não foi possível marcar o treinamento como finalizado.");
    button.disabled = false;
    button.textContent = "Marcar como finalizado";
  }
}

async function carregarTreinamentosAtribuidos() {
  const funcionarioId = getQueryParam("id");
  const searchInput = document.getElementById("searchInput");

  if (!funcionarioId) {
    alert("Funcionário não informado na URL.");
    return;
  }

  try {
    const [funcionarioRes, treinamentosRes, funcionarioLogado] = await Promise.all([
      fetch(`http://localhost:3000/funcionarios/${funcionarioId}`),
      fetch(`http://localhost:3000/treinamentos/atribuidos?funcionario_id=${funcionarioId}`),
      getFuncionarioLogado(),
    ]);

    if (funcionarioRes.ok) {
      const funcionario = await funcionarioRes.json();
      atualizarPerfil(funcionario);
    }

    if (!treinamentosRes.ok) {
      throw new Error(`Erro ao buscar treinamentos: ${treinamentosRes.status}`);
    }

    const dados = await treinamentosRes.json();
    const podeFinalizar = Boolean(
      funcionarioLogado &&
        String(funcionarioLogado.id) === String(funcionarioId)
    );

    const renderLista = (lista) => {
      atualizarResumo(lista);
      render(lista, podeFinalizar, marcarComoFinalizado);
    };

    renderLista(dados);

    searchInput.oninput = () => {
      const termo = searchInput.value.toLowerCase().trim();
      const filtrado = dados.filter(
        (item) =>
          (item.treinamento_nome || "").toLowerCase().includes(termo) ||
          (item.categoria || "").toLowerCase().includes(termo)
      );

      renderLista(filtrado);
    };
  } catch (err) {
    console.error(err);
    document.getElementById("treinamentosBody").innerHTML =
      '<tr><td colspan="4">Erro ao carregar os treinamentos.</td></tr>';
  }
}

function init() {
  carregarTreinamentosAtribuidos();

  const botaoVoltar = document.querySelector("button.voltar");
  if (botaoVoltar) {
    botaoVoltar.addEventListener("click", () => {
      window.history.back();
    });
  }
}

document.addEventListener("DOMContentLoaded", init);
