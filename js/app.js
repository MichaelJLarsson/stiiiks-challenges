/**
 * Main application logic for STIIICKS challenges app
 * Handles initialization, event handling, and coordination between modules
 */

class App {
  constructor() {
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    // Check authentication
    if (!authManager.requireAuth()) {
      return; // Will redirect to login
    }

    // Initialize UI
    this.initializeUI();
    
    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Initialize UI components
   */
  initializeUI() {
    // Render category buttons
    uiManager.renderCategoryButtons();
  }

  /**
   * Update user information in the UI
   */
  updateUserInfo() {
    const userEmail = authManager.getCurrentUser();
    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement && userEmail) {
      userInfoElement.textContent = `Logged in as: ${userEmail}`;
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        authManager.logout();
      });
    }

    // Handle challenge input changes
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('challenge-input')) {
        this.handleChallengeInput(e.target);
      }
    });

    // Handle URL submission
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('submit-url-btn')) {
        this.handleUrlSubmission(e.target);
      }
      
      if (e.target.classList.contains('edit-url-btn')) {
        this.handleEditUrl(e.target);
      }
    });

    // Handle challenge input blur (when user finishes typing)
    document.addEventListener('blur', (e) => {
      if (e.target.classList.contains('challenge-input')) {
        this.handleChallengeInputBlur(e.target);
      }
    }, true);
  }

  /**
   * Handle challenge input changes
   */
  handleChallengeInput(input) {
    const challengeId = input.dataset.challengeId;
    const url = input.value.trim();
    
    // Show submit button if URL is valid
    if (this.isValidUrl(url)) {
      this.showSubmitButton(input, challengeId);
    } else {
      this.hideSubmitButton(input);
    }
  }

  /**
   * Handle challenge input blur
   */
  handleChallengeInputBlur(input) {
    const challengeId = input.dataset.challengeId;
    const url = input.value.trim();
    
    if (this.isValidUrl(url)) {
      // Auto-submit if URL is valid
      this.submitChallengeUrl(challengeId, url);
    }
  }

  /**
   * Show submit button for challenge input
   */
  showSubmitButton(input, challengeId) {
    // Remove existing submit button if any
    const existingSubmit = input.parentElement.querySelector('.submit-url-btn');
    if (existingSubmit) {
      existingSubmit.remove();
    }

    // Create submit button
    const submitBtn = document.createElement('button');
    submitBtn.className = 'submit-url-btn';
    submitBtn.textContent = 'Submit';
    submitBtn.dataset.challengeId = challengeId;
    
    // Insert after input
    input.parentElement.appendChild(submitBtn);
  }

  /**
   * Hide submit button
   */
  hideSubmitButton(input) {
    const submitBtn = input.parentElement.querySelector('.submit-url-btn');
    if (submitBtn) {
      submitBtn.remove();
    }
  }

  /**
   * Handle URL submission
   */
  handleUrlSubmission(button) {
    const challengeId = button.dataset.challengeId;
    const input = button.parentElement.querySelector('.challenge-input');
    
    if (input && input.value.trim()) {
      this.submitChallengeUrl(challengeId, input.value.trim());
    }
  }

  /**
   * Submit challenge URL
   */
  submitChallengeUrl(challengeId, url) {
    const userEmail = authManager.getCurrentUser();
    
    // Save submission
    storageManager.submitChallenge(userEmail, challengeId, url);
    
    // Refresh UI
    uiManager.renderChallenges(uiManager.currentCategory);
    uiManager.updateSubcategoryCounters();
  }

  /**
   * Handle edit URL
   */
  handleEditUrl(button) {
    const challengeId = button.dataset.challengeId;
    const userEmail = authManager.getCurrentUser();
    const submission = storageManager.getChallengeSubmission(userEmail, challengeId);
    
    if (submission) {
      // Show input field with current URL
      this.showEditInput(challengeId, submission.url);
    }
  }

  /**
   * Show edit input for challenge
   */
  showEditInput(challengeId, currentUrl) {
    const challengeElement = document.querySelector(`[data-challenge-id="${challengeId}"]`);
    if (!challengeElement) return;

    // Create input container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'challenge-input-container';
    inputContainer.innerHTML = `
      <input 
        type="url" 
        class="challenge-input" 
        placeholder="Drop your Instagram or TikTok link here (Accept our follow so we can view your content)"
        data-challenge-id="${challengeId}"
        value="${currentUrl}"
      />
    `;

    // Replace challenge content
    const challengeContent = challengeElement.querySelector('.challenge-content');
    if (challengeContent) {
      const title = challengeContent.querySelector('.challenge-title');
      challengeContent.innerHTML = '';
      challengeContent.appendChild(title);
      challengeContent.appendChild(inputContainer);
    }

    // Focus input
    const input = inputContainer.querySelector('.challenge-input');
    if (input) {
      input.focus();
      input.select();
    }
  }

  /**
   * Validate URL
   */
  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  /**
   * Update challenge status (for admin use)
   */
  updateChallengeStatus(email, challengeId, status) {
    if (status === 'approved') {
      storageManager.approveChallenge(email, challengeId);
    }
    
    // Refresh UI
    uiManager.renderChallenges(uiManager.currentCategory);
    uiManager.updateSubcategoryCounters();
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
