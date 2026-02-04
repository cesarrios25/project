import { api, setSession, getSession, clearSession } from "./api.js";

const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");

const showAlert = (container, message, type = "error") => {
  if (!container) return;
  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
};

if (getSession()) {
  if (window.location.pathname.endsWith("index.html")) {
    window.location.href = "./dashboard.html";
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const alertBox = document.querySelector("#login-alert");
    alertBox.innerHTML = "";

    const email = document.querySelector("#email").value.trim().toLowerCase();
    const password = document.querySelector("#password").value.trim();

    try {
      const users = await api.get(
        `/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(
          password
        )}`
      );
      if (!users.length) {
        showAlert(alertBox, "Credenciales incorrectas.");
        return;
      }
      const user = users[0];
      setSession({ id: user.id, name: user.name, role: user.role, email });
      window.location.href = "./dashboard.html";
    } catch (error) {
      showAlert(alertBox, "No se pudo iniciar sesión.");
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const alertBox = document.querySelector("#register-alert");
    alertBox.innerHTML = "";

    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim().toLowerCase();
    const password = document.querySelector("#password").value.trim();

    if (!name || !email || !password) {
      showAlert(alertBox, "Completa todos los campos.");
      return;
    }

    try {
      const exists = await api.get(`/users?email=${encodeURIComponent(email)}`);
      if (exists.length) {
        showAlert(alertBox, "Ese correo ya está registrado.");
        return;
      }

      await api.post("/users", {
        name,
        email,
        password,
        role: "user",
      });

      clearSession();
      showAlert(alertBox, "Registro exitoso. Redirigiendo...", "success");
      setTimeout(() => {
        window.location.href = "./index.html";
      }, 1200);
    } catch (error) {
      showAlert(alertBox, "No se pudo registrar. Intenta nuevamente.");
    }
  });
}
