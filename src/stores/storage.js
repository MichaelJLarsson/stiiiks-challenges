import { writable, get } from 'svelte/store';
import { authStore } from './auth.js';

// Initialize data in localStorage
function initializeData() {
  if (!localStorage.getItem('stiiiks_categories')) {
    const categories = getSeedCategories();
    localStorage.setItem('stiiiks_categories', JSON.stringify(categories));
  }
  
  if (!localStorage.getItem('stiiiks_users')) {
    localStorage.setItem('stiiiks_users', JSON.stringify({}));
  }
}

// Get all categories with subcategories and challenges
function getCategories() {
  const categories = localStorage.getItem('stiiiks_categories');
  return categories ? JSON.parse(categories) : [];
}

// Get specific category by ID
function getCategoryById(categoryId) {
  const categories = getCategories();
  return categories.find(cat => cat.id === categoryId);
}

// Get all users data
function getUsers() {
  const users = localStorage.getItem('stiiiks_users');
  return users ? JSON.parse(users) : {};
}

// Get all user submissions
function getUserSubmissions(email) {
  const users = getUsers();
  return users[email] ? users[email].submissions : {};
}

// Get challenge submission details
function getChallengeSubmission(email, challengeId) {
  const submissions = getUserSubmissions(email);
  return submissions[challengeId] || null;
}

// Get challenge status for a user
function getChallengeStatus(email, challengeId) {
  const submissions = getUserSubmissions(email);
  return submissions[challengeId] ? submissions[challengeId].status : null;
}

// Submit a challenge (save URL with pending status)
function submitChallenge(email, challengeId, url) {
  const users = getUsers();
  
  if (!users[email]) {
    users[email] = { submissions: {} };
  }
  
  users[email].submissions[challengeId] = {
    url: url,
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  
  localStorage.setItem('stiiiks_users', JSON.stringify(users));
}

// Revoke a challenge submission
function revokeChallenge(email, challengeId) {
  const users = getUsers();
  
  if (users[email] && users[email].submissions[challengeId]) {
    delete users[email].submissions[challengeId];
    localStorage.setItem('stiiiks_users', JSON.stringify(users));
  }
}

// For admin use: approve a challenge submission
function approveChallenge(email, challengeId) {
  const users = getUsers();
  
  if (users[email] && users[email].submissions[challengeId]) {
    users[email].submissions[challengeId].status = 'approved';
    localStorage.setItem('stiiiks_users', JSON.stringify(users));
  }
}

// Seed data with all categories and challenges
function getSeedCategories() {
  return [
    {
      id: "burn-list",
      name: "Burn List",
      icon: "checklist-stroke",
      subcategories: [
        {
          id: "chill",
          name: "CHILL",
          challenges: [
            { id: "burn-list-chill-1", title: "Light a stick when you feel tired." },
            { id: "burn-list-chill-2", title: "Light a stick while dancing in the kitchen to Yellowman." },
            { id: "burn-list-chill-3", title: "Light a stick while entertaining a group of friends." }
          ]
        },
        {
          id: "wild",
          name: "WILD",
          challenges: [
            { id: "burn-list-wild-1", title: "Light a stick while doing something you've never done before." },
            { id: "burn-list-wild-2", title: "Light a stick while taking a risk that scares you." },
            { id: "burn-list-wild-3", title: "Light a stick while breaking a personal rule." },
            { id: "burn-list-wild-4", title: "Light a stick while being completely spontaneous." }
          ]
        },
        {
          id: "social",
          name: "SOCIAL",
          challenges: [
            { id: "burn-list-social-1", title: "Light a stick while introducing yourself to a stranger." },
            { id: "burn-list-social-2", title: "Light a stick while having a deep conversation with someone new." },
            { id: "burn-list-social-3", title: "Light a stick while attending a social event alone." },
            { id: "burn-list-social-4", title: "Light a stick while making plans with someone you haven't seen in months." }
          ]
        },
        {
          id: "chaos",
          name: "CHAOS",
          challenges: [
            { id: "burn-list-chaos-1", title: "Light a stick while doing something completely out of character." }
          ]
        }
      ]
    },
    {
      id: "tea-time",
      name: "Tea Time",
      icon: "clock-stroke",
      subcategories: [
        {
          id: "easy",
          name: "EASY",
          challenges: [
            { id: "tea-time-easy-1", title: "Schedule a date before the incense stick burns out." },
            { id: "tea-time-easy-2", title: "Unfollow someone you don't really like before the stick is done burning." },
            { id: "tea-time-easy-3", title: "Post a thirst trap before the ash hits the tray." }
          ]
        }
      ]
    },
    {
      id: "date-devil",
      name: "Date Devil",
      icon: "heart-stroke",
      subcategories: [
        {
          id: "first-date",
          name: "FIRST DATE",
          challenges: [
            { id: "date-devil-first-1", title: "Light a stick before going on a first date." },
            { id: "date-devil-first-2", title: "Light a stick while getting ready for a blind date." },
            { id: "date-devil-first-3", title: "Light a stick after a great first date." }
          ]
        },
        {
          id: "bad-date",
          name: "BAD DATE",
          challenges: [
            { id: "date-devil-bad-1", title: "Light a stick to recover from a terrible date." },
            { id: "date-devil-bad-2", title: "Light a stick while ghosting someone." },
            { id: "date-devil-bad-3", title: "Light a stick while getting ghosted." }
          ]
        }
      ]
    },
    {
      id: "delulu-zone",
      name: "Delulu Zone",
      icon: "comment-stroke",
      subcategories: [
        {
          id: "easy",
          name: "EASY",
          challenges: [
            { id: "delulu-zone-easy-1", title: "Light a stick while manifesting your dream life." },
            { id: "delulu-zone-easy-2", title: "Light a stick while writing in your manifestation journal." },
            { id: "delulu-zone-easy-3", title: "Light a stick while creating a vision board." }
          ]
        }
      ]
    },
    {
      id: "the-drop",
      name: "The Drop",
      icon: "box-stroke",
      subcategories: [
        {
          id: "single-af",
          name: "SINGLE AF",
          challenges: [
            { id: "the-drop-single-1", title: "Light a stick while embracing your single life." },
            { id: "the-drop-single-2", title: "Light a stick while deleting dating apps." },
            { id: "the-drop-single-3", title: "Light a stick while focusing on self-love." }
          ]
        },
        {
          id: "ghosted",
          name: "GHOSTED",
          challenges: [
            { id: "the-drop-ghosted-1", title: "Light a stick while processing being ghosted." },
            { id: "the-drop-ghosted-2", title: "Light a stick while moving on from someone who ghosted you." },
            { id: "the-drop-ghosted-3", title: "Light a stick while realizing your worth." },
            { id: "the-drop-ghosted-4", title: "Light a stick while deleting their number." }
          ]
        },
        {
          id: "bad-date",
          name: "BAD DATE",
          challenges: [
            { id: "the-drop-bad-1", title: "Light a stick after a disappointing date." },
            { id: "the-drop-bad-2", title: "Light a stick while analyzing what went wrong." },
            { id: "the-drop-bad-3", title: "Light a stick while deciding to try again." },
            { id: "the-drop-bad-4", title: "Light a stick while swearing off dating." }
          ]
        },
        {
          id: "sticky",
          name: "STICKY",
          challenges: [
            { id: "the-drop-sticky-1", title: "Light a stick while stuck in a situationship." }
          ]
        }
      ]
    },
    {
      id: "truth-tag",
      name: "Truth Tag",
      icon: "@-stroke",
      subcategories: [
        {
          id: "honest",
          name: "HONEST",
          challenges: [
            { id: "truth-tag-honest-1", title: "Light a stick while being completely honest with yourself." },
            { id: "truth-tag-honest-2", title: "Light a stick while admitting a hard truth." },
            { id: "truth-tag-honest-3", title: "Light a stick while facing reality." }
          ]
        }
      ]
    },
    {
      id: "smoke-story",
      name: "Smoke Story",
      icon: "wand-stroke",
      subcategories: [
        {
          id: "creative",
          name: "CREATIVE",
          challenges: [
            { id: "smoke-story-creative-1", title: "Light a stick while writing your story." },
            { id: "smoke-story-creative-2", title: "Light a stick while creating art that represents your journey." },
            { id: "smoke-story-creative-3", title: "Light a stick while sharing your story with someone." }
          ]
        }
      ]
    }
  ];
}

// Initialize data on module load
initializeData();

// Create writable store to trigger reactivity
const storageStore = writable({});

// Export storage functions
export const storage = {
  getCategories,
  getCategoryById,
  getUsers,
  getUserSubmissions,
  getChallengeSubmission,
  getChallengeStatus,
  submitChallenge,
  revokeChallenge,
  approveChallenge,
  // Trigger reactivity when storage changes
  refresh: () => storageStore.update(s => ({}))
};
