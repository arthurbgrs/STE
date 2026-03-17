const ul = document.querySelector(".lista");
const modal = document.getElementById("modal");
const modalFields = {
  nome: document.getElementById("modal-nome"),
  cpf: document.getElementById("modal-cpf"),
  departamento: document.getElementById("modal-departamento"),
  cargo: document.getElementById("modal-cargo"),
  telefone: document.getElementById("modal-telefone"),
  email: document.getElementById("modal-email"),
  detalhes: document.getElementById("modal-detalhes"),
};

async function buscarUsuarios() {
  const resposta = await fetch("http://localhost:3000/funcionarios");
  const lista = await resposta.json();
  preencherLista(lista);
}


  function preencherLista(lista) {
  lista
    .filter(funcionario => funcionario.ativo)
    .forEach((funcionario) => {
      const li = document.createElement("li");
      li.classList.add("funcionario");
      const h2 = document.createElement("h2");
      h2.textContent = funcionario.nome;
      const button = document.createElement("button");
      button.textContent = "Detalhes";
      button.addEventListener("click", () => showDetails(funcionario.id));

      li.append(h2, button);
      ul.appendChild(li);
    });
}



async function showDetails(id) {
  try {
    const res = await fetch(`http://localhost:3000/funcionarios/${id}`);
    if (!res.ok) throw new Error("Erro na busca do funcionário");
    const data = await res.json();
    openModal(data);
  } catch (err) {
    console.error(err);
    alert("Não foi possível carregar os detalhes.");
  }
}

function openModal(data) {
  modalFields.nome.textContent = `Nome: ${data.nome || ""}`;
  modalFields.cpf.textContent = `CPF: ${data.cpf || ""}`;
  modalFields.departamento.textContent = `Departamento: ${data.departamento || ""}`;
  modalFields.cargo.textContent = `Cargo: ${data.cargo || ""}`;
  modalFields.telefone.textContent = `Telefone: ${data.telefone || ""}`;
  modalFields.email.textContent = `Email: ${data.email || ""}`;
  modalFields.detalhes.textContent = `Detalhes: ${data.detalhes || ""}`;

  modal.classList.remove("hidden");
}

// close handlers
modal.querySelector(".close").addEventListener("click", () => {
  modal.classList.add("hidden");
});
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

buscarUsuarios();

const quantidade = document.querySelector("#quantidade");
let quantidadeTotal = 0

async function puxarQuantidade() {
  try {
    const resposta = await fetch("http://localhost:3000/funcionarios");
    const lista = await resposta.json();
  
    const map = lista.map((funcionario) => {
      if (funcionario.ativo) {
        quantidadeTotal++
      }
    });

      quantidade.textContent = quantidadeTotal + " Funcionarios"
  } catch (error) {
    console.log(error);
  }
}

puxarQuantidade()
