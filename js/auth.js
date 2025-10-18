/**
 * Authentication module for STIIICKS challenges app
 * Handles login/logout with localStorage persistence
 */

class AuthManager {
  constructor() {
    this.currentUserKey = 'stiiicks_current_user';
  }

  /**
   * Login with email (store as current user)
   */
  login(email, password) {
    // For MVP: just store email, ignore password validation
    localStorage.setItem(this.currentUserKey, email);
    return true;
  }

  /**
   * Logout and clear current user
   */
  logout() {
    localStorage.removeItem(this.currentUserKey);
    // Redirect to login page
    window.location.href = 'index.html';
  }

  /**
   * Get currently logged in user
   */
  getCurrentUser() {
    return localStorage.getItem(this.currentUserKey);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  /**
   * Redirect to login if not authenticated
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }

  /**
   * Redirect to challenges page if already authenticated
   */
  redirectIfAuthenticated() {
    if (this.isAuthenticated()) {
      window.location.href = 'challenges.html';
      return true;
    }
    return false;
  }
}

// Create global instance
window.authManager = new AuthManager();
