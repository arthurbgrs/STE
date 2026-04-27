const sharedLogoutButton = document.getElementById("logoutButton");

function redirectToLoginPage() {
  window.location.href = "../index.html";
}

function handleSharedLogout() {
  localStorage.removeItem("user");
  redirectToLoginPage();
}

if (sharedLogoutButton) {
  sharedLogoutButton.addEventListener("click", handleSharedLogout);
}
