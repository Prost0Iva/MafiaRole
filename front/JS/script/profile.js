// front/JS/script/profile.js
import { AuthService } from "../auth.js";

async function initProfile() {
  // Проверяем авторизацию через localStorage
  const user = AuthService.getCurrentUser();
  
  if (!user) {
    // Если нет в localStorage, проверяем сервер
    const authResult = await AuthService.checkAuth();
    
    if (!authResult.authenticated || !authResult.user) {
      window.location.href = "log.html";
      return;
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('mafia_user', JSON.stringify(authResult.user));
    showProfile(authResult.user);
  } else {
    showProfile(user);
  }
}

function showProfile(user) {
  document.getElementById("user-name").textContent = user.name;
  
  document.getElementById("logout").addEventListener("click", async () => {
    await AuthService.logout();
    localStorage.removeItem('mafia_user');
    window.location.href = "main.html";
  });
}

document.addEventListener("DOMContentLoaded", initProfile);