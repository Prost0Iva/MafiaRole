// front/JS/script/main.js
import { AuthService } from "../auth.js";
import { CardsManager } from "./cards.js";

async function initMainPage() {
  await updateAuthButtons();
  await CardsManager.loadCards();
  CardsManager.initCardEvents();
  addCreateCardButton();
}

async function updateAuthButtons() {
  try {
    const user = AuthService.getCurrentUser();
    const buttonsContainer = document.getElementById("main-title-buttons");
    const profileIcon = document.getElementById("profile-icon");
    const profileName = document.getElementById("profile-name");
    
    if (user) {
      // Пользователь авторизован
      console.log("User is authenticated:", user);
      
      // Показываем имя пользователя
      if (profileName) {
        profileName.textContent = user.name;
        profileName.style.color = "#FFFFFF";
        profileName.style.fontWeight = "bold";
        profileName.style.fontSize = "1em";
        profileName.style.cursor = "pointer";
        profileName.style.transition = "color 0.3s ease";
        
        // Клик по имени ведет в профиль
        profileName.addEventListener('click', () => {
          window.location.href = "profile.html";
        });
        
        // Эффект при наведении
        profileName.addEventListener('mouseenter', () => {
          profileName.style.color = "#DDDDDD";
        });
        
        profileName.addEventListener('mouseleave', () => {
          profileName.style.color = "#FFFFFF";
        });
      }
      
      // Настраиваем иконку профиля
      if (profileIcon) {
        profileIcon.style.backgroundImage = "url(../../assets/profile.svg)";
        profileIcon.style.backgroundSize = "cover";
        profileIcon.style.backgroundRepeat = "no-repeat";
        profileIcon.style.width = "2em";
        profileIcon.style.height = "2em";
        profileIcon.style.cursor = "pointer";
        
        // Клик по иконке ведет в профиль
        profileIcon.addEventListener('click', () => {
          window.location.href = "profile.html";
        });
        
        // Эффект при наведении
        profileIcon.addEventListener('mouseenter', () => {
          profileIcon.style.opacity = "0.8";
        });
        
        profileIcon.addEventListener('mouseleave', () => {
          profileIcon.style.opacity = "1";
        });
      }
      
      // Обновляем кнопки (если нужно)
      if (buttonsContainer) {
        buttonsContainer.innerHTML = `
          <a href=""><button class="title-button">Generator</button></a>
          <a href="about_us.html"><button class="title-button">About Us</button></a>
          <a href="profile.html" style="margin-left: auto">
            <div id="title-profile" style="display: flex; align-items: center; gap: 10px; margin-right: .5em;">
              <div id="profile-icon"></div>
              <span id="profile-name"></span>
            </div>
          </a>
        `;
        
        // После изменения HTML, снова настраиваем элементы
        setTimeout(() => {
          updateProfileElements(user);
        }, 100);
      }
      
    } else {
      // Пользователь не авторизован
      console.log("User is NOT authenticated");
      
      // Скрываем имя пользователя
      if (profileName) {
        profileName.textContent = "";
        profileName.style.display = "none";
      }
      
      // Иконка для входа
      if (profileIcon) {
        profileIcon.style.backgroundImage = "url(../../assets/profile.svg)";
        profileIcon.style.backgroundSize = "cover";
        profileIcon.style.backgroundRepeat = "no-repeat";
        profileIcon.style.width = "2em";
        profileIcon.style.height = "2em";
        profileIcon.style.cursor = "pointer";
        
        profileIcon.addEventListener('click', () => {
          window.location.href = "log.html";
        });
        
        profileIcon.addEventListener('mouseenter', () => {
          profileIcon.style.backgroundImage = "url(../../assets/profile_active.svg)";
        });
        
        profileIcon.addEventListener('mouseleave', () => {
          profileIcon.style.backgroundImage = "url(../../assets/profile.svg)";
        });
      }
      
      // Если нет контейнера, создаем кнопку входа
      if (!profileIcon && buttonsContainer) {
        buttonsContainer.innerHTML = `
          <a href=""><button class="title-button">Generator</button></a>
          <a href="about_us.html"><button class="title-button">About Us</button></a>
          <a href="log.html" style="margin-left: auto"><button class="title-button">Login</button></a>
        `;
      }
    }
  } catch (error) {
    console.error("Error updating auth buttons:", error);
  }
}

// Функция для настройки элементов профиля после изменения HTML
function updateProfileElements(user) {
  const profileIcon = document.getElementById("profile-icon");
  const profileName = document.getElementById("profile-name");
  
  if (user && profileName) {
    profileName.textContent = user.name;
    profileName.style.color = "#FFFFFF";
    profileName.style.fontWeight = "bold";
    profileName.style.fontSize = "1em";
    profileName.style.cursor = "pointer";
    
    profileName.addEventListener('click', () => {
      window.location.href = "profile.html";
    });
    
    profileName.addEventListener('mouseenter', () => {
      profileName.style.color = "#DDDDDD";
    });
    
    profileName.addEventListener('mouseleave', () => {
      profileName.style.color = "#FFFFFF";
    });
  }
  
//   if (profileIcon) {
//     profileIcon.style.backgroundImage = "url(../../assets/profile.svg)";
//     profileIcon.style.backgroundSize = "cover";
//     profileIcon.style.backgroundRepeat = "no-repeat";
//     profileIcon.style.width = "2em";
//     profileIcon.style.height = "2em";
//     profileIcon.style.cursor = "pointer";
    
//     profileIcon.addEventListener('click', () => {
//       window.location.href = "profile.html";
//     });
//   }
}

function addCreateCardButton() {
  // Проверяем, есть ли уже кнопка создания
  if (document.getElementById('create-card-btn-global')) return;
  
  const mainElement = document.querySelector('main');
  if (!mainElement) return;
  
  // Создаем контейнер для кнопки
  const buttonContainer = document.createElement('div');
  buttonContainer.style.textAlign = 'center';
  buttonContainer.style.margin = '20px 0';
  
  const createButton = document.createElement('button');
  createButton.id = 'create-card-btn-global';
  createButton.textContent = 'Add Your Card';
  
  // Стили в твоём стиле
  createButton.style.border = '.2em solid #555555';
  createButton.style.borderRadius = '1em';
  createButton.style.backgroundColor = '#FFFFFF';
  createButton.style.color = '#555555';
  createButton.style.fontWeight = 'bold';
  createButton.style.padding = '12px 25px';
  createButton.style.cursor = 'pointer';
  createButton.style.fontSize = '1.1em';
  createButton.style.margin = '20px auto';
  createButton.style.display = 'block';
  createButton.style.transition = 'all 0.3s ease';

  createButton.addEventListener('mouseenter', () => {
    createButton.style.border = '.2em solid #FFFFFF';
    createButton.style.backgroundColor = '#555555';
    createButton.style.color = '#FFFFFF';
    createButton.style.transform = 'scale(1.05)';
  });

  createButton.addEventListener('mouseleave', () => {
    createButton.style.border = '.2em solid #555555';
    createButton.style.backgroundColor = '#FFFFFF';
    createButton.style.color = '#555555';
    createButton.style.transform = 'scale(1)';
  });
  
  createButton.addEventListener('click', async () => {
    const user = AuthService.getCurrentUser();
    if (!user) {
      alert('To create a card, you need to login!');
      window.location.href = 'log.html';
      return;
    }
    
    await CardsManager.showCreateModal();
  });
  
  buttonContainer.appendChild(createButton);
  
  // Вставляем кнопку перед списком карточек
  const cardsList = document.getElementById('cards-list');
  if (cardsList) {
    mainElement.insertBefore(buttonContainer, cardsList);
  } else {
    mainElement.appendChild(buttonContainer);
  }
}

// Запускаем при загрузке страницы
document.addEventListener("DOMContentLoaded", initMainPage);