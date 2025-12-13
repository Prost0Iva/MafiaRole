// front/JS/auth.js
const API_BASE = 'http://localhost:3000';

export class AuthService {
static getCurrentUser() {
  try {
    const userData = localStorage.getItem('mafia_user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error("Error getting user from localStorage:", error);
    return null;
  }
}

  static async checkAuth() {
    console.log('AuthService.checkAuth вызван');
    console.log('Текущие cookies:', document.cookie);
    
    try {
      const response = await fetch(`${API_BASE}/api/auth/check`, {
        method: "POST",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('set-cookie'));
      
      const data = await response.json();
      console.log('Auth check result:', data);
      
      return data;
    } catch (error) {
      console.error("Auth check error:", error);
      return { authenticated: false };
    }
  }

  static async login(name, password) {
    console.log('AuthService.login вызван для:', name);
    
    try {
      const response = await fetch(`${API_BASE}/api/uscheck`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, password }),
        credentials: 'include'
      });
      
      console.log('Login response status:', response.status);
      console.log('Login response cookies:', response.headers.get('set-cookie'));
      
      const result = await response.json();
      console.log('Login result:', result);
      
      // Сохраняем в localStorage как резервный вариант
      if (result.success && result.user) {
        localStorage.setItem('mafia_user', JSON.stringify(result.user));
      }
      
      return result;
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Connection error" };
    }
  }

  static async register(name, password) {
    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, password }),
        credentials: 'include'
      });
      
      return await response.json();
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Connection error" };
    }
  }

  static async logout() {
    try {
      const response = await fetch("http://localhost:3000/api/logout", {
        method: "POST",
        credentials: 'include'
      });
      
      return await response.json();
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false };
    }
  }

  // ========== МЕТОДЫ ДЛЯ КАРТОЧЕК ==========
  
  static async getCards() {
    try {
      const response = await fetch(`${API_BASE}/api/cards/get`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get cards error:", error);
      return { success: false, error: error.message };
    }
  }

  static async createCard(name, description) {
    const user = this.getCurrentUser();
    if (!user) {
      return { success: false, error: "Не авторизован" };
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/cards/create`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          user_id: user.id
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Create card error:", error);
      return { success: false, error: error.message };
    }
  }

  static async updateCard(cardId, name, description) {
    const user = this.getCurrentUser();
    if (!user) {
      return { success: false, error: "Не авторизован" };
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/cards/update`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_id: cardId,
          name,
          description,
          user_id: user.id
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Update card error:", error);
      return { success: false, error: error.message };
    }
  }

  static async deleteCard(cardId) {
    const user = this.getCurrentUser();
    if (!user) {
      return { success: false, error: "Не авторизован" };
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/cards/delete`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_id: cardId,
          user_id: user.id
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Delete card error:", error);
      return { success: false, error: error.message };
    }
  }

  // Вспомогательный метод для получения текущего пользователя
  static getCurrentUser() {
    const userData = localStorage.getItem('mafia_user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  }

  // Проверка является ли пользователь админом
  static isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }
}