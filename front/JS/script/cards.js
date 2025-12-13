// front/JS/script/cards.js
import { AuthService } from "../auth.js";

export class CardsManager {
  static MAX_DESCRIPTION_LENGTH = 100; // Максимальная длина текста в карточке
  static MAX_TITLE_LENGTH = 4; // Максимальная длина названия в карточке
  
  static async loadCards() {
    const result = await AuthService.getCards();
    
    if (result.success) {
      this.displayCards(result.cards);
    } else {
      console.error("Error loading cards:", result.error);
    }
  }

  static displayCards(cards) {
    const cardsContainer = document.getElementById("cards-list");
    if (!cardsContainer) return;
    
    cardsContainer.innerHTML = '';
    
    if (cards.length === 0) {
      cardsContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No cards yet. Be the first!</p>';
      return;
    }
    
    const currentUser = AuthService.getCurrentUser();
    
    cards.forEach(card => {
      const cardElement = this.createCardElement(card, currentUser);
      cardsContainer.appendChild(cardElement);
    });
  }

  static createCardElement(card, currentUser) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'role-card';
    cardDiv.dataset.cardId = card.id;
    
    // Format date
    const date = new Date(card.date);
    const formattedDate = date.toLocaleDateString('ru-RU');
    
    // Truncate title if too long
    const shortTitle = card.name.length > this.MAX_TITLE_LENGTH 
      ? card.name.substring(0, this.MAX_TITLE_LENGTH) + '...' 
      : card.name;
    
    // Truncate description if needed
    const shortDescription = card.description.length > this.MAX_DESCRIPTION_LENGTH 
      ? card.description.substring(0, this.MAX_DESCRIPTION_LENGTH) + '...' 
      : card.description;
    
    cardDiv.innerHTML = `
      <div class="card-title">
        <img src="assets/logo.svg" alt="" class="card-logo">
        <p class="card-name" title="${this.escapeHtml(card.name)}">${this.escapeHtml(shortTitle)}</p>
      </div>
      <p class="card-description" title="${this.escapeHtml(card.description)}">${this.escapeHtml(shortDescription)}</p>
      <div class="card-create-info">
        <p>${this.escapeHtml(card.author_name || card.author)}</p>
        <p>${formattedDate}</p>
      </div>
      <button class="view-card-btn" data-card-id="${card.id}">
        More...
      </button>
    `;
    
    return cardDiv;
  }

  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  static initCardEvents() {
    // Handler for view card button
    document.addEventListener('click', async (e) => {
      if (e.target.classList.contains('view-card-btn')) {
        const cardId = e.target.dataset.cardId;
        await this.showCardModal(cardId);
      }
    });
  }

  static async showCardModal(cardId) {
    // Load card data
    const cards = await AuthService.getCards();
    if (!cards.success) return;
    
    const card = cards.cards.find(c => c.id == cardId);
    if (!card) return;
    
    const currentUser = AuthService.getCurrentUser();
    const isAuthor = currentUser && currentUser.id === card.user_id;
    const isAdmin = AuthService.isAdmin();
    
    // Format date
    const date = new Date(card.date);
    const formattedDate = date.toLocaleDateString('ru-RU');
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay card-modal-overlay';
modal.innerHTML = `
  <div class="modal card-modal">
    <div class="card-modal-header">
      <h3>${this.escapeHtml(card.name)}</h3>
      <div class="card-modal-actions">
        ${isAuthor ? `<button class="edit-card-modal-btn" data-card-id="${card.id}">Edit</button>` : ''}
        ${isAdmin ? `<button class="delete-card-modal-btn" data-card-id="${card.id}">Delete</button>` : ''}
        <button class="close-modal-btn">✕</button>
      </div>
    </div>
    
    <div class="card-modal-content">
      <div class="card-modal-description">
        <h4>Description:</h4>
        <p>${this.escapeHtml(card.description).replace(/\n/g, '<br>')}</p>
      </div>
      
      <div class="card-modal-info">
        <div class="info-item">
          <strong>Author:</strong>
          <span>${this.escapeHtml(card.author_name || card.author)}</span>
        </div>
        <div class="info-item">
          <strong>Date:</strong>
          <span>${formattedDate}</span>
        </div>
      </div>
    </div>
    
    <div class="modal-footer">
      <button class="close-full-btn">Close</button>
    </div>
  </div>
`;
    
    document.body.appendChild(modal);
    
    // Modal handlers
    const closeModal = () => modal.remove();
    
    // Close button
    modal.querySelector('.close-modal-btn').addEventListener('click', closeModal);
    modal.querySelector('.close-full-btn').addEventListener('click', closeModal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // Edit button (if present)
    const editBtn = modal.querySelector('.edit-card-modal-btn');
    if (editBtn) {
      editBtn.addEventListener('click', async () => {
        closeModal();
        await this.showEditModal(cardId);
      });
    }
    
    // Delete button (if present)
    const deleteBtn = modal.querySelector('.delete-card-modal-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this card?')) {
          closeModal();
          await this.deleteCard(cardId);
        }
      });
    }
  }

  static async showEditModal(cardId) {
    // Load card data
    const cards = await AuthService.getCards();
    if (!cards.success) return;
    
    const card = cards.cards.find(c => c.id == cardId);
    if (!card) return;
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Edit Card</h3>
          <button class="close-modal-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="edit-card-name">Card Name:</label>
            <input type="text" id="edit-card-name" value="${this.escapeHtml(card.name)}" placeholder="Enter card name" maxlength="100">
            <span class="char-counter"><span id="edit-name-chars">${card.name.length}</span>/100</span>
          </div>
          <div class="form-group">
            <label for="edit-card-description">Description:</label>
            <textarea id="edit-card-description" rows="6" placeholder="Enter description..." maxlength="1000">${this.escapeHtml(card.description)}</textarea>
            <span class="char-counter"><span id="edit-desc-chars">${card.description.length}</span>/1000</span>
          </div>
        </div>
        <div class="modal-footer">
          <button id="save-card-btn" class="btn-primary">Save</button>
          <button id="cancel-edit-btn" class="btn-secondary">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Character counters for edit modal
    const nameInput = document.getElementById('edit-card-name');
    const descTextarea = document.getElementById('edit-card-description');
    const nameChars = document.getElementById('edit-name-chars');
    const descChars = document.getElementById('edit-desc-chars');
    
    nameInput.addEventListener('input', () => {
      nameChars.textContent = nameInput.value.length;
    });
    
    descTextarea.addEventListener('input', () => {
      descChars.textContent = descTextarea.value.length;
    });
    
    // Modal handlers
    const closeModalFunc = () => modal.remove();
    
    modal.querySelector('.close-modal-btn').addEventListener('click', closeModalFunc);
    document.getElementById('cancel-edit-btn').addEventListener('click', closeModalFunc);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModalFunc();
      }
    });
    
    // Save changes
    document.getElementById('save-card-btn').addEventListener('click', async () => {
      const name = nameInput.value.trim();
      const description = descTextarea.value.trim();
      
      if (!name || !description) {
        alert('Fill in all the fields!');
        return;
      }
      
      if (name.length > 100) {
        alert('The name must not exceed 100 characters!');
        return;
      }
      
      const result = await AuthService.updateCard(cardId, name, description);
      
      if (result.success) {
        alert('The card has been successfully updated!');
        closeModalFunc();
        await this.loadCards();
      } else {
        alert(`Error: ${result.error}`);
      }
    });
  }

  static async deleteCard(cardId) {
    const result = await AuthService.deleteCard(cardId);
    
    if (result.success) {
      alert('Card deleted successfully!');
      await this.loadCards();
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  static async showCreateModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Create New Card</h3>
          <button class="close-modal-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="new-card-name">Role:</label>
            <input type="text" id="new-card-name" placeholder="Enter role name" maxlength="100">
            <span class="char-counter"><span id="name-chars">0</span>/100</span>
          </div>
          <div class="form-group">
            <label for="new-card-description">Description:</label>
            <textarea id="new-card-description" rows="6" placeholder="Enter description..." maxlength="1000"></textarea>
            <span class="char-counter"><span id="desc-chars">0</span>/1000</span>
          </div>
        </div>
        <div class="modal-footer">
          <button id="create-card-btn" class="btn-primary">Create</button>
          <button id="cancel-create-btn" class="btn-secondary">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Character counters
    const nameInput = document.getElementById('new-card-name');
    const descTextarea = document.getElementById('new-card-description');
    const nameChars = document.getElementById('name-chars');
    const descChars = document.getElementById('desc-chars');
    
    nameInput.addEventListener('input', () => {
      nameChars.textContent = nameInput.value.length;
    });
    
    descTextarea.addEventListener('input', () => {
      descChars.textContent = descTextarea.value.length;
    });
    
    // Modal handlers
    const closeModalFunc = () => modal.remove();
    
    modal.querySelector('.close-modal-btn').addEventListener('click', closeModalFunc);
    document.getElementById('cancel-create-btn').addEventListener('click', closeModalFunc);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModalFunc();
      }
    });
    
    // Create card
    document.getElementById('create-card-btn').addEventListener('click', async () => {
      const name = nameInput.value.trim();
      const description = descTextarea.value.trim();
      
      if (!name || !description) {
        alert('Fill in all the fields!');
        return;
      }
      
      if (name.length > 100) {
        alert('The name must not exceed 100 characters!');
        return;
      }
      
      if (description.length > 1000) {
        alert('The description must not exceed 1000 characters!');
        return;
      }
      
      const result = await AuthService.createCard(name, description);
      
      if (result.success) {
        alert('The card was created successfully!');
        closeModalFunc();
        await this.loadCards();
      } else {
        alert(`Error: ${result.error}`);
      }
    });
  }
}