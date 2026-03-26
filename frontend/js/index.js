const listaRecentes = document.querySelector(".lista-recentes");
const modal = document.getElementById("modal");
const saudacaoUsuario = document.getElementById("saudacao-usuario");
const modalFoto = document.getElementById("modal-foto");
const quantidade = document.getElementById("quantidade");
const modalFields = {
  nome: document.getElementById("modal-nome"),
  cpf: document.getElementById("modal-cpf"),
  departamento: document.getElementById("modal-departamento"),
  cargo: document.getElementById("modal-cargo"),
  telefone: document.getElementById("modal-telefone"),
  email: document.getElementById("modal-email"),
  detalhes: document.getElementById("modal-detalhes"),
};

function preencherNomeUsuarioAtual() {
  try {
    const userSalvo = localStorage.getItem("user");

    if (!userSalvo) {
      return;
    }

    const user = JSON.parse(userSalvo);

    if (user?.nome && saudacaoUsuario) {
      saudacaoUsuario.innerHTML = `Ola, <strong>${user.nome}</strong>`;
    }
  } catch (error) {
    console.error("Erro ao carregar usuario atual:", error);
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

function funcionarioEstaAtivo(funcionario) {
  return funcionario.ativo !== 0 && funcionario.ativo !== false;
}

function preencherDashboard(lista) {
  const ativos = lista.filter(funcionarioEstaAtivo);
  const recentes = [...ativos].sort((a, b) => (b.id || 0) - (a.id || 0));

  if (quantidade) {
    quantidade.textContent = String(ativos.length);
  }

  if (!listaRecentes) {
    return;
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

async function showDetails(id) {
  try {
    const res = await fetch(`http://localhost:3000/funcionarios/${id}`);
    if (!res.ok) {
      throw new Error("Erro na busca do funcionario");
    }

    const data = await res.json();
    openModal(data);
  } catch (err) {
    console.error(err);
    alert("Nao foi possivel carregar os detalhes.");
  }
}

function openModal(data) {
  const fotoPath = data.foto || "";

  if (fotoPath) {
    modalFoto.src = fotoPath.startsWith("/") ? `http://localhost:3000${fotoPath}` : fotoPath;
    modalFoto.classList.add("visivel");
  } else {
    modalFoto.removeAttribute("src");
    modalFoto.classList.remove("visivel");
  }

  modalFields.nome.textContent = `Nome: ${data.nome || ""}`;
  modalFields.cpf.textContent = `CPF: ${data.cpf || ""}`;
  modalFields.departamento.textContent = `Departamento: ${data.departamento || ""}`;
  modalFields.cargo.textContent = `Cargo: ${data.cargo || ""}`;
  modalFields.telefone.textContent = `Telefone: ${data.telefone || ""}`;
  modalFields.email.textContent = `Email: ${data.email || ""}`;
  modalFields.detalhes.textContent = `Detalhes: ${data.detalhes || ""}`;

  modal.classList.remove("hidden");
}

modal.querySelector(".close").addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

buscarUsuarios();
preencherNomeUsuarioAtual();
