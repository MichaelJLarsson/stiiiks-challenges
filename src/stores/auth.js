import { writable, derived } from 'svelte/store';

const CURRENT_USER_KEY = 'stiiiks_current_user';

// Create a writable store for the current user
function createAuthStore() {
  const { subscribe, set, update } = writable(localStorage.getItem(CURRENT_USER_KEY));

  return {
    subscribe,
    login: (email, password) => {
      localStorage.setItem(CURRENT_USER_KEY, email);
      set(email);
      return true;
    },
    logout: () => {
      localStorage.removeItem(CURRENT_USER_KEY);
      set(null);
    },
    getCurrentUser: () => {
      return localStorage.getItem(CURRENT_USER_KEY);
    },
  };
}

export const authStore = createAuthStore();

// Derived store to check if user is authenticated
export const isAuthenticated = derived(authStore, ($authStore) => !!$authStore);
