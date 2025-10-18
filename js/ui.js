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
      
      // Add icon SVG
      button.innerHTML = `
        <svg width="32" height="29" viewBox="0 0 32 29" fill="none" xmlns="http://www.w3.org/2000/svg" class="category-icon">
          ${this.getCategoryIconPath(category.icon)}
        </svg>
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
   * Get SVG path for category icon
   */
  getCategoryIconPath(iconName) {
    const iconPaths = {
      'checklist-stroke': '<path d="M22.5309 19.4998C23.0397 18.985 23.8645 18.985 24.3733 19.4998C24.8821 20.0146 24.8821 20.849 24.3733 21.3638L18.5103 27.2956C18.0015 27.8104 17.1767 27.8104 16.6679 27.2956L14.0621 24.6593C13.5533 24.1445 13.5533 23.3101 14.0621 22.7953C14.5709 22.2805 15.3957 22.2805 15.9045 22.7953L17.5891 24.4996L22.5309 19.4998ZM9.12027 17.1364C9.83984 17.1364 10.4232 17.7265 10.4232 18.4545C10.4232 19.1826 9.83984 19.7727 9.12027 19.7727H6.51448C5.79491 19.7727 5.21158 19.1826 5.21158 18.4545C5.21158 17.7265 5.79491 17.1364 6.51448 17.1364H9.12027ZM23.3942 15.1591V7.6452C23.3942 6.51632 23.3938 5.74882 23.3459 5.15559C23.2992 4.57767 23.2143 4.28172 23.1105 4.07555C22.8607 3.57958 22.4619 3.17617 21.9717 2.92343C21.7679 2.81839 21.4754 2.7325 20.9042 2.68528C20.3179 2.63683 19.5592 2.63637 18.4435 2.63637H7.55654C6.44075 2.63637 5.68215 2.63683 5.0958 2.68528C4.52459 2.7325 4.23206 2.81839 4.02829 2.92343C3.53807 3.17617 3.13934 3.57958 2.88953 4.07555C2.7857 4.28172 2.70081 4.57767 2.65414 5.15559C2.60625 5.74882 2.60579 6.51632 2.60579 7.6452V21.3548C2.60579 22.4837 2.60625 23.2512 2.65414 23.8444C2.70081 24.4223 2.7857 24.7183 2.88953 24.9244C3.13934 25.4204 3.53807 25.8238 4.02829 26.0766C4.23206 26.1816 4.52459 26.2675 5.0958 26.3147C5.68215 26.3632 6.44075 26.3636 7.55654 26.3636H11.7261C12.4456 26.3636 13.029 26.9538 13.029 27.6818C13.029 28.4098 12.4456 29 11.7261 29H7.55654C6.48362 29 5.6004 29.0013 4.88331 28.9421C4.15101 28.8815 3.4773 28.7518 2.845 28.4259C1.86456 27.9204 1.06709 27.1136 0.567474 26.1216C0.245301 25.4819 0.117099 24.8003 0.0572587 24.0594C-0.00132965 23.3339 2.37977e-06 22.4403 2.53973e-06 21.3548V7.6452C2.37977e-06 6.55969 -0.00132965 5.66611 0.0572587 4.94061C0.117099 4.19972 0.245301 3.5181 0.567474 2.87838C1.06709 1.88644 1.86456 1.07961 2.845 0.574133C3.4773 0.248179 4.15101 0.118473 4.88331 0.0579305C5.6004 -0.00134525 6.48362 2.40766e-06 7.55654 2.56951e-06H18.4435C19.5164 2.40766e-06 20.3996 -0.00134525 21.1167 0.0579305C21.849 0.118473 22.5227 0.248179 23.155 0.574133C24.1354 1.07961 24.9329 1.88643 25.4325 2.87838C25.7547 3.5181 25.8829 4.19972 25.9427 4.94061C26.0013 5.66611 26 6.55969 26 7.6452V15.1591C26 15.8871 25.4167 16.4773 24.6971 16.4773C23.9775 16.4773 23.3942 15.8871 23.3942 15.1591ZM14.3318 11.8636C15.0514 11.8636 15.6347 12.4538 15.6347 13.1818C15.6347 13.9098 15.0514 14.5 14.3318 14.5H6.51448C5.79491 14.5 5.21158 13.9098 5.21158 13.1818C5.21158 12.4538 5.79491 11.8636 6.51448 11.8636H14.3318ZM19.4855 6.59091C20.2051 6.59091 20.7884 7.18108 20.7884 7.90909C20.7884 8.6371 20.2051 9.22727 19.4855 9.22727H6.51448C5.79491 9.22727 5.21158 8.6371 5.21158 7.90909C5.21158 7.18108 5.79491 6.59091 6.51448 6.59091H19.4855Z" fill="currentColor"/>',
      'clock-stroke': '<path d="M26.1691 15.4473C26.0444 12.9383 24.9906 10.5568 23.2003 8.77214C21.2909 6.86864 18.7004 5.79991 16 5.79991C13.2996 5.79991 10.7091 6.86864 8.79967 8.77214C6.89019 10.6756 5.81811 13.258 5.81811 15.95C5.81811 18.6419 6.89019 21.2243 8.79967 23.1278C10.7091 25.0313 13.2996 26.1 16 26.1L16.5043 26.0872C19.0211 25.9629 21.4101 24.9124 23.2003 23.1278C25.1098 21.2243 26.1819 18.6419 26.1819 15.95L26.1691 15.4473ZM20.0625 12.0247C20.6306 11.4585 21.5513 11.4585 22.1194 12.0247C22.6874 12.591 22.6874 13.5089 22.1194 14.0751L15.5739 20.6002C15.0058 21.1664 14.0851 21.1664 13.517 20.6002L10.6079 17.7002C10.0399 17.1339 10.0399 16.216 10.6079 15.6498C11.176 15.0835 12.0967 15.0835 12.6648 15.6498L14.5454 17.5246L20.0625 12.0247ZM4.7897 0.424697C5.35773 -0.141566 6.27849 -0.141566 6.84653 0.424697C7.41457 0.990959 7.41457 1.90883 6.84653 2.4751L2.48286 6.82511C1.91482 7.39137 0.994069 7.39137 0.426029 6.82511C-0.14201 6.25885 -0.14201 5.34098 0.426029 4.77471L4.7897 0.424697ZM25.1535 0.424697C25.7215 -0.141566 26.6423 -0.141566 27.2103 0.424697L31.574 4.77471C32.142 5.34098 32.142 6.25885 31.574 6.82511C31.0059 7.39137 30.0852 7.39137 29.5171 6.82511L25.1535 2.4751C24.5854 1.90883 24.5854 0.990959 25.1535 0.424697ZM29.0754 16.5971C28.9389 19.3386 27.9362 21.9594 26.2259 24.0935L28.6649 26.5248C29.2329 27.0911 29.2329 28.0089 28.6649 28.5752C28.0968 29.1415 27.1761 29.1415 26.608 28.5752L24.1691 26.1439C22.0283 27.8488 19.3993 28.8484 16.6492 28.9844L16 29C13.0161 29 10.1383 27.983 7.82949 26.1439L5.39197 28.5752C4.82393 29.1415 3.90318 29.1415 3.33514 28.5752C2.7671 28.0089 2.7671 27.0911 3.33514 26.5248L5.77266 24.0935C3.92857 21.7921 2.909 18.9239 2.909 15.95C2.909 12.4889 4.2878 9.1691 6.74283 6.72174C9.19787 4.27438 12.5281 2.8999 16 2.8999C19.4719 2.8999 22.8021 4.27438 25.2572 6.72174C27.7122 9.1691 29.091 12.4889 29.091 15.95L29.0754 16.5971Z" fill="currentColor"/>',
      'heart-stroke': '<path d="M14.8852 5.58446C12.4052 2.64537 8.4631 1.99252 5.53425 4.52899C2.47486 7.17881 2.06248 11.5652 4.44191 14.669C5.44687 15.9797 7.44611 18.0281 9.61809 20.1277C11.7661 22.2042 14.007 24.2579 15.4392 25.5534C15.7198 25.8072 15.8682 25.9397 15.9818 26.0271C15.9844 26.0291 15.9878 26.031 15.9903 26.0329C15.9928 26.031 15.9962 26.0291 15.9988 26.0271C16.1125 25.9397 16.2609 25.8072 16.5414 25.5534C17.9736 24.2579 20.2145 22.2042 22.3625 20.1277C24.5345 18.0281 26.5338 15.9797 27.5387 14.669C29.931 11.5484 29.5495 7.14326 26.462 4.54195C23.4555 2.00888 19.5646 2.65825 17.0954 5.58446C16.8191 5.91173 16.4153 6.09995 15.9903 6.09995C15.5653 6.09995 15.1615 5.91172 14.8852 5.58446ZM20.0628 8.54351C20.6308 7.96769 21.5516 7.96769 22.1196 8.54351C22.6877 9.11933 22.6877 10.0527 22.1196 10.6285L15.5741 17.2637C15.0061 17.8395 14.0853 17.8395 13.5173 17.2637L10.6082 14.3147C10.0401 13.7389 10.0401 12.8055 10.6082 12.2297C11.1762 11.6539 12.097 11.6539 12.665 12.2297L14.5457 14.1362L20.0628 8.54351Z" fill="currentColor"/>',
      'comment-stroke': '<path d="M26 2H6C3.79086 2 2 3.79086 2 6V18C2 20.2091 3.79086 22 6 22H8.58579L13.2929 26.7071C13.6834 27.0976 14.3166 27.0976 14.7071 26.7071L19.4142 22H26C28.2091 22 30 20.2091 30 18V6C30 3.79086 28.2091 2 26 2ZM28 18C28 19.1046 27.1046 20 26 20H19.4142L16 23.4142L12.5858 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H26C27.1046 4 28 4.89543 28 6V18ZM8 8H24V10H8V8ZM8 12H20V14H8V12Z" fill="currentColor"/>',
      'box-stroke': '<path d="M28 4H4C2.89543 4 2 4.89543 2 6V22C2 23.1046 2.89543 24 4 24H28C29.1046 24 30 23.1046 30 22V6C30 4.89543 29.1046 4 28 4ZM28 22H4V6H28V22ZM8 200H24V12H8V20ZM10 14H22V18H10V14Z" fill="currentColor"/>',
      '@-stroke': '<path d="M16 2C8.26801 2 2 8.26801 2 16C2 23.732 8.26801 30 16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2ZM16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16C28 22.6274 22.6274 28 16 28ZM16 8C12.6863 8 10 10.6863 10 14C10 17.3137 12.6863 20 16 20C17.3807 20 18.6307 19.5786 19.618 18.868L21.618 20.868C20.0633 22.4227 18.1363 23.2 16 23.2C11.5817 23.2 8 19.6183 8 14C8 8.58172 11.5817 5 16 5C20.4183 5 24 8.58172 24 14V15.2H21.2V14C21.2 10.6863 18.5137 8 16 8ZM16 18C13.7909 18 12 16.2091 12 14C12 11.7909 13.7909 10 16 10C18.2091 10 20 11.7909 20 14C20 16.2091 18.2091 18 16 18Z" fill="currentColor"/>',
      'wand-stroke': '<path d="M26.1691 15.4473C26.0444 12.9383 24.9906 10.5568 23.2003 8.77214C21.2909 6.86864 18.7004 5.79991 16 5.79991C13.2996 5.79991 10.7091 6.86864 8.79967 8.77214C6.89019 10.6756 5.81811 13.258 5.81811 15.95C5.81811 18.6419 6.89019 21.2243 8.79967 23.1278C10.7091 25.0313 13.2996 26.1 16 26.1L16.5043 26.0872C19.0211 25.9629 21.4101 24.9124 23.2003 23.1278C25.1098 21.2243 26.1819 18.6419 26.1819 15.95L26.1691 15.4473ZM20.0625 12.0247C20.6306 11.4585 21.5513 11.4585 22.1194 12.0247C22.6874 12.591 22.6874 13.5089 22.1194 14.0751L15.5739 20.6002C15.0058 21.1664 14.0851 21.1664 13.517 20.6002L10.6079 17.7002C10.0399 17.1339 10.0399 16.216 10.6079 15.6498C11.176 15.0835 12.0967 15.0835 12.6648 15.6498L14.5454 17.5246L20.0625 12.0247Z" fill="currentColor"/>'
    };
    
    return iconPaths[iconName] || iconPaths['checklist-stroke'];
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14ZM8.5 4H7.5V9L11.5 11.5L12 10.5L8.5 8.5V4Z" fill="currentColor"/>
            </svg>
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="currentColor"/>
            </svg>
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
