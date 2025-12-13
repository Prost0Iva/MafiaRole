// front/JS/script/reg.js
import { AuthService } from "../auth.js";

document.getElementById("reg-form-first-button").addEventListener("click", async () => {
  const name = document.getElementById("name-input").value;
  const password = document.getElementById("pass-input").value;
  const repass = document.getElementById("repass-input").value;

  // Валидация
  if (!name || !password || !repass) {
    alert("All fields are required!");
    return;
  }

  if (name.length < 3 || name.length > 16) {
    alert("The name must be between 3 and 16 characters long!");
    return;
  }

  if (password.length < 8 || password.length > 16) {
    alert("The password must be between 8 and 16 characters long!");
    return;
  }

  if (password !== repass) {
    alert("Passwords don't match!");
    return;
  }

  const button = document.getElementById("reg-form-first-button");
  const originalText = button.innerHTML;
  button.innerHTML = "Registration...";
  button.disabled = true;

  try {
    const result = await AuthService.register(name, password);
    
    if (result.success) {
      alert("Registration is successful!");
      window.location.href = "main.html";
    } else {
      alert(`Error: ${result.error || result.message || "Registration error"}`);
    }
  } catch (error) {
    alert("Server connection error");
    console.error(error);
  } finally {
    button.innerHTML = originalText;
    button.disabled = false;
  }
});