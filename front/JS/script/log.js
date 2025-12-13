// front/JS/script/log.js
import { AuthService } from "../auth.js";

document.getElementById("reg-form-first-button").addEventListener("click", async () => {
  const name = document.getElementById("name-input").value;
  const password = document.getElementById("pass-input").value;

  if (!name || !password) {
    alert("Enter your name and password!");
    return;
  }

  const button = document.getElementById("reg-form-first-button");
  const originalText = button.innerHTML;
  button.innerHTML = "Вход...";
  button.disabled = true;

  try {
    const result = await AuthService.login(name, password);
    
    if (result.success) {
      alert("The login is successful!");
      window.location.href = "main.html";
    } else {
      alert(`Error: ${result.message || result.error || "Incorrect data"}`);
    }
  } catch (error) {
    alert("Server connection error");
    console.error(error);
  } finally {
    button.innerHTML = originalText;
    button.disabled = false;
  }
});