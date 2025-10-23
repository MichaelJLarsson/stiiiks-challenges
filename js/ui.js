/**
 * UI rendering module for STIIICKS challenges app
 * Handles DOM manipulation and rendering of categories, challenges, and states
 */

class UIManager {
  constructor() {
    this.currentCategory = null;
  }

  /**
   * Render category buttons
   */
  renderCategoryButtons() {
    const categories = storageManager.getCategories();
    const categoryContainer = document.getElementById('categoryButtons');
    
    if (!categoryContainer) return;

    categoryContainer.innerHTML = '';

    categories.forEach(category => {
      const button = document.createElement('button');
      button.className = 'category-button';
      button.setAttribute('data-category-id', category.id);
      button.setAttribute('aria-label', category.name);
      
      // Add icon from assets folder
      button.innerHTML = `
        <img src="./assets/${category.icon}.svg" alt="${category.name} icon" class="category-icon" width="32" height="29" />
      `;

      // Add click handler
      button.addEventListener('click', () => {
        this.selectCategory(category.id);
      });

      categoryContainer.appendChild(button);
    });

    // Select first category by default
    if (categories.length > 0) {
      this.selectCategory(categories[0].id);
    }
  }


  /**
   * Select a category and render its challenges
   */
  selectCategory(categoryId) {
    // Update button states
    document.querySelectorAll('.category-button').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    const selectedButton = document.querySelector(`[data-category-id="${categoryId}"]`);
    if (selectedButton) {
      selectedButton.classList.add('selected');
    }

    // Update current category
    this.currentCategory = categoryId;
    
    // Render challenges for this category
    this.renderChallenges(categoryId);
  }

  /**
   * Render challenges for a specific category
   */
  renderChallenges(categoryId) {
    const category = storageManager.getCategoryById(categoryId);
    const challengesContainer = document.getElementById('challengesContainer');
    
    if (!category || !challengesContainer) return;

    // Update category title
    const categoryTitle = document.getElementById('categoryTitle');
    if (categoryTitle) {
      categoryTitle.textContent = category.name;
    }

    // Clear container
    challengesContainer.innerHTML = '';

    // Render subcategories
    category.subcategories.forEach(subcategory => {
      const subcategoryElement = this.createSubcategoryElement(subcategory);
      challengesContainer.appendChild(subcategoryElement);
    });
  }

  /**
   * Create subcategory element with challenges
   */
  createSubcategoryElement(subcategory) {
    const subcategoryDiv = document.createElement('div');
    subcategoryDiv.className = 'subcategory';
    
    // Count approved challenges for this subcategory
    const userEmail = authManager.getCurrentUser();
    const approvedCount = this.countApprovedChallenges(userEmail, subcategory.challenges);
    
    subcategoryDiv.innerHTML = `
      <div class="subcategory-header">
        <h3 class="subcategory-title">${subcategory.name} ${approvedCount}/${subcategory.challenges.length}</h3>
      </div>
      <div class="challenges-list">
        ${subcategory.challenges.map(challenge => this.createChallengeElement(challenge)).join('')}
      </div>
    `;

    return subcategoryDiv;
  }

  /**
   * Create individual challenge element
   */
  createChallengeElement(challenge) {
    const userEmail = authManager.getCurrentUser();
    const submission = storageManager.getChallengeSubmission(userEmail, challenge.id);
    const status = submission ? submission.status : null;

    return `
      <div class="challenge-item" data-challenge-id="${challenge.id}">
        <div class="challenge-bar ${this.getChallengeStateClass(status)}">
          <div class="challenge-content">
            <h4 class="challenge-title">${challenge.title}</h4>
            ${this.getChallengeStateHTML(challenge.id, submission)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get CSS class for challenge state
   */
  getChallengeStateClass(status) {
    switch (status) {
      case 'pending':
        return 'submitted';
      case 'approved':
        return 'approved';
      default:
        return 'default';
    }
  }

  /**
   * Get HTML for challenge state
   */
  getChallengeStateHTML(challengeId, submission) {
    if (!submission) {
      // Default state - show input field
      return `
        <div class="challenge-input-container">
          <input 
            type="url" 
            class="challenge-input" 
            placeholder="Drop your Instagram or TikTok link here (Accept our follow so we can view your content)"
            data-challenge-id="${challengeId}"
          />
        </div>
      `;
    } else if (submission.status === 'pending') {
      // Submitted state - show URL with clock icon
      return `
        <div class="challenge-submitted">
          <div class="challenge-url">
            <span class="url-text">${submission.url}</span>
            <button class="edit-url-btn" data-challenge-id="${challengeId}">Edit</button>
          </div>
          <div class="status-indicator pending">
            <img src="./assets/clock-stroke.svg" alt="Pending" width="16" height="16" />
            <span>Pending</span>
          </div>
        </div>
      `;
    } else if (submission.status === 'approved') {
      // Approved state - show URL with checkmark
      return `
        <div class="challenge-approved">
          <div class="challenge-url">
            <span class="url-text">${submission.url}</span>
            <button class="edit-url-btn" data-challenge-id="${challengeId}">Edit</button>
          </div>
          <div class="status-indicator approved">
            <img src="./assets/checklist-stroke.svg" alt="Approved" width="16" height="16" />
            <span>Approved</span>
          </div>
        </div>
      `;
    }
  }

  /**
   * Count approved challenges in a list
   */
  countApprovedChallenges(userEmail, challenges) {
    return challenges.filter(challenge => {
      const status = storageManager.getChallengeStatus(userEmail, challenge.id);
      return status === 'approved';
    }).length;
  }

  /**
   * Update subcategory counters
   */
  updateSubcategoryCounters() {
    if (!this.currentCategory) return;
    
    const category = storageManager.getCategoryById(this.currentCategory);
    const userEmail = authManager.getCurrentUser();
    
    category.subcategories.forEach(subcategory => {
      const counter = this.countApprovedChallenges(userEmail, subcategory.challenges);
      const titleElement = document.querySelector(`[data-subcategory="${subcategory.id}"] .subcategory-title`);
      if (titleElement) {
        titleElement.textContent = `${subcategory.name} ${counter}/${subcategory.challenges.length}`;
      }
    });
  }

  /**
   * Expand challenge to show input
   */
  expandChallenge(challengeId) {
    // This is handled by the challenge input events
  }

  /**
   * Collapse challenge
   */
  collapseChallenge(challengeId) {
    // This is handled by the challenge input events
  }
}

// Create global instance
window.uiManager = new UIManager();
