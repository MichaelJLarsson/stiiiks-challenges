/**
 * UI rendering module for STIIICKS challenges app
 * Handles DOM manipulation and rendering of categories, challenges, and states
 */

class UIManager {
  constructor() {
    this.currentCategory = null;
    this.svgCache = new Map(); // Cache for SVG content
  }

  /**
   * Fetch SVG content from file and cache it
   */
  async fetchSVGContent(iconName, className = '') {
    if (this.svgCache.has(iconName)) {
      return this.svgCache.get(iconName);
    }

    try {
      const response = await fetch(`./assets/${iconName}.svg`);
      if (!response.ok) {
        throw new Error(`Failed to fetch SVG: ${response.statusText}`);
      }
      let svgContent = await response.text();
      
      // Add class to SVG element if provided
      if (className) {
        svgContent = svgContent.replace('<svg', `<svg class="${className}"`);
      }
      
      this.svgCache.set(iconName, svgContent);
      return svgContent;
    } catch (error) {
      console.error(`Error fetching SVG ${iconName}:`, error);
      const fallbackSvg = `<svg width="32" height="29" viewBox="0 0 32 29" fill="none" xmlns="http://www.w3.org/2000/svg" class="${className}"><path d="M16 2L18.5 8.5L25 11L18.5 13.5L16 20L13.5 13.5L7 11L13.5 8.5L16 2Z" fill="currentColor"/></svg>`;
      return fallbackSvg;
    }
  }

  /**
   * Get inline SVG content synchronously (for use in templates)
   */
  getInlineSVG(iconName, className = '') {
    if (this.svgCache.has(iconName)) {
      return this.svgCache.get(iconName);
    }
    
    // Return a placeholder if not cached yet
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="${className}"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2"/></svg>`;
  }

  /**
   * Render category buttons
   */
  async renderCategoryButtons() {
    const categories = storageManager.getCategories();
    const categoryContainer = document.getElementById('categoryButtons');
    
    if (!categoryContainer) return;

    categoryContainer.innerHTML = '';

    // Fetch all SVG content in parallel
    const svgPromises = categories.map(category => 
      this.fetchSVGContent(category.icon, 'category-icon').then(svgContent => ({
        category,
        svgContent
      }))
    );

    const svgResults = await Promise.all(svgPromises);

    svgResults.forEach(({ category, svgContent }) => {
      const button = document.createElement('button');
      button.className = 'category-button';
      button.setAttribute('data-category-id', category.id);
      button.setAttribute('aria-label', category.name);
      
      // Add inline SVG icon
      button.innerHTML = svgContent;

      // Add click handler
      button.addEventListener('click', async () => {
        await this.selectCategory(category.id);
      });

      categoryContainer.appendChild(button);
    });

    // Select first category by default
    if (categories.length > 0) {
      await this.selectCategory(categories[0].id);
    }
  }


  /**
   * Select a category and render its challenges
   */
  async selectCategory(categoryId) {
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
    await this.renderChallenges(categoryId);
  }

  /**
   * Render challenges for a specific category
   */
  async renderChallenges(categoryId) {
    const category = storageManager.getCategoryById(categoryId);
    const challengesContainer = document.getElementById('challengesContainer');
    
    if (!category || !challengesContainer) return;

    // Update category title
    const categoryTitle = document.getElementById('categoryTitle');
    if (categoryTitle) {
      categoryTitle.textContent = category.name;
    }

    // Preload status icons
    await Promise.all([
      this.fetchSVGContent('clock-stroke', 'status-icon'),
      this.fetchSVGContent('checklist-stroke', 'status-icon')
    ]);

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
            ${this.getInlineSVG('clock-stroke', 'status-icon')}
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
            ${this.getInlineSVG('checklist-stroke', 'status-icon')}
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
