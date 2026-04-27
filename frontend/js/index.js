const listaRecentes = document.querySelector(".lista-recentes");
const modal = document.getElementById("modal");
const saudacaoUsuario = document.getElementById("saudacao-usuario");
const inicialUsuario = document.getElementById("inicial-usuario");
const inicialGerenciarFuncionarios = document.getElementById("inicial-gerenciar-funcionarios");
const modalFoto = document.getElementById("modal-foto");
const quantidade = document.getElementById("quantidade");
const adminMenu = document.getElementById("adminMenu");
const adminResumo = document.getElementById("adminResumo");
const adminActionsSection = document.getElementById("adminActionsSection");
const adminEmployeesSection = document.getElementById("adminEmployeesSection");
const funcionarioTreinamentosSection = document.getElementById("funcionarioTreinamentosSection");
const treinamentosAviso = document.getElementById("treinamentosAviso");
const treinamentosLista = document.getElementById("treinamentosLista");
const logoutButton = document.getElementById("logoutButton");
let currentSessionUser = null;
const modalFields = {
  nome: document.getElementById("modal-nome"),
  cpf: document.getElementById("modal-cpf"),
  departamento: document.getElementById("modal-departamento"),
  cargo: document.getElementById("modal-cargo"),
  telefone: document.getElementById("modal-telefone"),
  email: document.getElementById("modal-email"),
  detalhes: document.getElementById("modal-detalhes"),
};

function getCurrentUser() {
  try {
    const userSalvo = localStorage.getItem("user");
    return userSalvo ? JSON.parse(userSalvo) : null;
  } catch (error) {
    console.error("Erro ao carregar usuario do localStorage:", error);
    return null;
  }
}

function redirectToLogin() {
  window.location.href = "../index.html";
}

function preencherNomeUsuarioAtual(user) {
  if (!user || !saudacaoUsuario) return;
  saudacaoUsuario.innerHTML = `Olá, <strong>${user.nome || "usuário"}</strong>`;

  if (inicialUsuario) {
    inicialUsuario.textContent = obterPrimeiraInicial(user.nome || "usuário");
  }

  if (inicialGerenciarFuncionarios) {
    inicialGerenciarFuncionarios.textContent = obterPrimeiraInicial(user.nome || "usuário");
  }
}

function obterIniciais(nome = "") {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() || "")
    .join("");
}

function obterPrimeiraInicial(nome = "") {
  return nome.trim().charAt(0).toUpperCase() || "U";
}

function getTrainingStatus(item) {
  if (item?.finalizado) return "Finalizado";
  if (!item?.data_vencimento) return "Desconhecido";

  const vencimento = new Date(item.data_vencimento);
  if (Number.isNaN(vencimento.getTime())) return "Desconhecido";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (vencimento < hoje) return "Vencido";
  return "Pendente";
}

function getTrainingStatusClass(status) {
  return status
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function funcionarioEstaAtivo(funcionario) {
  return funcionario.ativo !== 0 && funcionario.ativo !== false;
}

function preencherDashboard(lista) {
  if (!listaRecentes) return;

  const ativos = lista.filter(funcionarioEstaAtivo);
  const recentes = [...ativos].sort((a, b) => (b.id || 0) - (a.id || 0));

  if (quantidade) {
    quantidade.textContent = String(ativos.length);
  }

  listaRecentes.innerHTML = "";

  recentes.forEach((funcionario) => {
    const li = document.createElement("li");
    li.className = "funcionario";

    const avatar = document.createElement("div");
    avatar.className = "funcionario-avatar";

    const fotoPath = funcionario.foto || "";
    if (fotoPath) {
      const img = document.createElement("img");
      img.src = fotoPath.startsWith("/") ? `http://localhost:3000${fotoPath}` : fotoPath;
      img.alt = funcionario.nome || "Funcionario";
      avatar.appendChild(img);
    } else {
      avatar.textContent = obterIniciais(funcionario.nome || "F");
    }

    const info = document.createElement("div");
    info.className = "funcionario-info";

    const nome = document.createElement("h3");
    nome.textContent = funcionario.nome || "Funcionario";

    const cargo = document.createElement("p");
    cargo.textContent = funcionario.cargo || "Sem cargo";

    info.append(nome, cargo);

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Detalhes";
    button.addEventListener("click", () => showDetails(funcionario.id));

    li.append(avatar, info, button);
    listaRecentes.appendChild(li);
  });
}

function preencherModalDetalhes(funcionario) {
  const fotoPath = funcionario.foto || "";

  if (modalFoto) {
    if (fotoPath) {
      modalFoto.src = fotoPath.startsWith("/") ? `http://localhost:3000${fotoPath}` : fotoPath;
      modalFoto.classList.add("visivel");
    } else {
      modalFoto.removeAttribute("src");
      modalFoto.classList.remove("visivel");
    }
  }

  if (modalFields.nome) modalFields.nome.textContent = funcionario.nome || "—";
  if (modalFields.cpf) modalFields.cpf.textContent = `CPF: ${funcionario.cpf || "—"}`;
  if (modalFields.departamento) {
    modalFields.departamento.textContent = `Departamento: ${funcionario.departamento || "—"}`;
  }
  if (modalFields.cargo) modalFields.cargo.textContent = `Cargo: ${funcionario.cargo || "—"}`;
  if (modalFields.telefone) {
    modalFields.telefone.textContent = `Telefone: ${funcionario.telefone || "—"}`;
  }
  if (modalFields.email) modalFields.email.textContent = `E-mail: ${funcionario.email || "—"}`;
  if (modalFields.detalhes) modalFields.detalhes.textContent = `Detalhes: ${funcionario.detalhes || "—"}`;
}

async function showDetails(funcionarioId) {
  if (!funcionarioId || !modal) return;

  try {
    const resposta = await fetch(`http://localhost:3000/funcionarios/${funcionarioId}`);
    if (!resposta.ok) {
      throw new Error(`Erro ao carregar funcionario ${funcionarioId}`);
    }

    const funcionario = await resposta.json();
    preencherModalDetalhes(funcionario);
    modal.classList.remove("hidden");
  } catch (error) {
    console.error("Erro ao carregar detalhes do funcionario:", error);
    alert("Não foi possível carregar os detalhes do funcionário.");
  }
}

function updateSectionsForRole(role) {
  if (adminMenu) adminMenu.style.display = role === "adm" ? "flex" : "none";
  if (adminResumo) adminResumo.style.display = role === "adm" ? "grid" : "none";
  if (adminActionsSection) adminActionsSection.style.display = role === "adm" ? "block" : "none";
  if (adminEmployeesSection) adminEmployeesSection.style.display = role === "adm" ? "block" : "none";
  if (funcionarioTreinamentosSection) funcionarioTreinamentosSection.classList.toggle("hidden", role === "adm");
}

async function buscarUsuarios() {
  try {
    const resposta = await fetch("http://localhost:3000/funcionarios");
    if (!resposta.ok) {
      throw new Error("Erro ao carregar funcionarios");
    }

    const lista = await resposta.json();
    preencherDashboard(lista);
  } catch (error) {
    console.error(error);
  }
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("pt-BR");
}

async function marcarTreinamentoComoFinalizado(atribuidoId) {
  try {
    const resposta = await fetch(`http://localhost:3000/treinamentos/atribuidos/${atribuidoId}/finalizar`, {
      method: "PUT",
    });

    if (!resposta.ok) {
      throw new Error("Erro ao marcar treinamento como finalizado");
    }

    if (currentSessionUser?.role === "funcionario") {
      await buscarTreinamentosDoFuncionario(currentSessionUser);
    }
  } catch (error) {
    console.error(error);
    alert("Não foi possível marcar o treinamento como finalizado.");
  }
}

function renderEmployeeTrainings(rows) {
  if (!treinamentosAviso || !treinamentosLista) return;

  if (!Array.isArray(rows) || rows.length === 0) {
    treinamentosAviso.innerHTML = "<p>NÃO HÁ TREINAMENTOS</p>";
    treinamentosLista.innerHTML = "";
    return;
  }

  treinamentosAviso.innerHTML = `<p>Você possui ${rows.length} treinamento${rows.length === 1 ? "" : "s"} atribuído${rows.length === 1 ? "" : "s"}.</p>`;
  treinamentosLista.innerHTML = "";

  rows.forEach((item) => {
    const card = document.createElement("div");
    card.className = "treinamento-item";
    const status = getTrainingStatus(item);
    const statusClass = getTrainingStatusClass(status);

    const title = document.createElement("h3");
    title.textContent = item.treinamento_nome || "Treinamento sem nome";

    const detalhes = document.createElement("p");
    detalhes.innerHTML = `<strong>Categoria:</strong> ${item.categoria || "N/A"}<br /><strong>Vencimento:</strong> ${formatDate(item.data_vencimento)}`;

    const statusBadge = document.createElement("span");
    statusBadge.className = `treinamento-status ${statusClass}`;
    statusBadge.textContent = status.toUpperCase();

    card.append(title, detalhes, statusBadge);

    if (currentSessionUser?.role === "funcionario" && !item.finalizado) {
      const actions = document.createElement("div");
      actions.className = "treinamento-acoes";

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Marcar como finalizado";
      button.addEventListener("click", async () => {
        button.disabled = true;
        button.textContent = "Salvando...";
        await marcarTreinamentoComoFinalizado(item.atribuido_id);
      });

      actions.appendChild(button);
      card.appendChild(actions);
    }

    treinamentosLista.appendChild(card);
  });
}

function renderNoTrainingsMessage(message) {
  if (!treinamentosAviso || !treinamentosLista) return;
  treinamentosAviso.innerHTML = `<p>${message}</p>`;
  treinamentosLista.innerHTML = "";
}

async function buscarTreinamentosDoFuncionario(user) {
  if (!user?.email) {
    renderNoTrainingsMessage("E-mail do usuário não encontrado.");
    return;
  }

  try {
    const email = encodeURIComponent(user.email.trim().toLowerCase());
    const funcionarioRes = await fetch(`http://localhost:3000/funcionarios/email/${email}`);

    if (funcionarioRes.status === 404) {
      renderNoTrainingsMessage("Usuário não está vinculado a um funcionário cadastrado.");
      return;
    }

    if (!funcionarioRes.ok) {
      throw new Error("Erro ao buscar funcionário associado");
    }

    const funcionario = await funcionarioRes.json();

    const treinamentoRes = await fetch(`http://localhost:3000/treinamentos/atribuidos?funcionario_id=${funcionario.id}`);
    if (!treinamentoRes.ok) {
      throw new Error("Erro ao buscar treinamentos atribuídos");
    }

    const treinamentos = await treinamentoRes.json();
    renderEmployeeTrainings(treinamentos);
  } catch (error) {
    console.error(error);
    renderNoTrainingsMessage("Erro ao carregar seus treinamentos. Tente novamente mais tarde.");
  }
}

function handleLogout() {
  localStorage.removeItem("user");
  redirectToLogin();
}

async function init() {
  if (!saudacaoUsuario) {
    return;
  }

  const user = getCurrentUser();
  if (!user) {
    redirectToLogin();
    return;
  }

  currentSessionUser = user;

  preencherNomeUsuarioAtual(user);
  updateSectionsForRole(user.role);

  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }

  if (user.role === "adm") {
    await buscarUsuarios();
  } else {
    await buscarTreinamentosDoFuncionario(user);
  }
}

modal?.querySelector(".close")?.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal?.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

init();
