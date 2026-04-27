function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

const currentUser = getCurrentUser();
if (!currentUser) {
  window.location.href = "../index.html";
} else if (currentUser.role !== "adm") {
  window.location.href = "/frontend/pages/paginainicial.html";
}
