import { writable } from 'svelte/store';
import * as supabaseStore from './supabaseStore.js';

// Create writable store to trigger reactivity
const storageStore = writable({});

// Note: This is a compatibility layer that wraps Supabase functions
// to maintain the existing API while using Supabase under the hood

// ==================== CATEGORY FUNCTIONS ====================

/**
 * Get all categories with subcategories and challenges
 */
export async function getCategories() {
  try {
    return await supabaseStore.getCategories();
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
}

/**
 * Get specific category by ID
 */
export async function getCategoryById(categoryId) {
  try {
    return await supabaseStore.getCategoryById(categoryId);
  } catch (error) {
    console.error('Error getting category:', error);
    return null;
  }
}

// ==================== USER FUNCTIONS ====================

/**
 * Get all users data
 */
export async function getUsers() {
  try {
    const users = await supabaseStore.getUsers();
    // Transform to old format for compatibility
    const usersObject = {};
    users.forEach((user) => {
      usersObject[user.email] = {
        id: user.id,
        email: user.email,
        submissions: {}, // Will be loaded separately if needed
      };
    });
    return usersObject;
  } catch (error) {
    console.error('Error getting users:', error);
    return {};
  }
}

/**
 * Get all user submissions
 */
export async function getUserSubmissions(email) {
  try {
    const submissions = await supabaseStore.getUserSubmissions(email);
    // Transform to old format for compatibility
    const submissionsObject = {};
    submissions.forEach((submission) => {
      submissionsObject[submission.challenge_id] = {
        url: submission.url,
        status: submission.status,
        timestamp: submission.created_at,
      };
    });
    return submissionsObject;
  } catch (error) {
    console.error('Error getting user submissions:', error);
    return {};
  }
}

/**
 * Get challenge submission details
 */
export async function getChallengeSubmission(email, challengeId) {
  try {
    const submissions = await supabaseStore.getUserSubmissions(email);
    const submission = submissions.find((s) => s.challenge_id === challengeId);
    if (!submission) return null;

    return {
      url: submission.url,
      status: submission.status,
      timestamp: submission.created_at,
    };
  } catch (error) {
    console.error('Error getting challenge submission:', error);
    return null;
  }
}

/**
 * Get challenge status for a user
 */
export async function getChallengeStatus(email, challengeId) {
  try {
    const submission = await getChallengeSubmission(email, challengeId);
    return submission ? submission.status : null;
  } catch (error) {
    console.error('Error getting challenge status:', error);
    return null;
  }
}

// ==================== SUBMISSION FUNCTIONS ====================

/**
 * Submit a challenge (save URL with pending status)
 */
export async function submitChallenge(email, challengeId, url) {
  try {
    await supabaseStore.submitChallenge(email, challengeId, url);
    storageStore.update((s) => ({})); // Trigger reactivity
    return true;
  } catch (error) {
    console.error('Error submitting challenge:', error);
    throw error;
  }
}

/**
 * Revoke a challenge submission
 */
export async function revokeChallenge(email, challengeId) {
  try {
    // Get user's submissions to find the submission ID
    const submissions = await supabaseStore.getUserSubmissions(email);
    const submission = submissions.find((s) => s.challenge_id === challengeId);
    
    if (submission) {
      await supabaseStore.rejectSubmission(submission.id);
      storageStore.update((s) => ({})); // Trigger reactivity
    }
  } catch (error) {
    console.error('Error revoking challenge:', error);
    throw error;
  }
}

/**
 * For admin use: approve a challenge submission
 */
export async function approveChallenge(email, challengeId) {
  try {
    // Get user's submissions to find the submission ID
    const submissions = await supabaseStore.getUserSubmissions(email);
    const submission = submissions.find((s) => s.challenge_id === challengeId);
    
    if (submission) {
      await supabaseStore.approveSubmission(submission.id);
      storageStore.update((s) => ({})); // Trigger reactivity
    }
  } catch (error) {
    console.error('Error approving challenge:', error);
    throw error;
  }
}

// Export storage object with all functions for backward compatibility
export const storage = {
  // Category functions
  getCategories,
  getCategoryById,
  
  // User functions
  getUsers,
  getUserSubmissions,
  getChallengeSubmission,
  getChallengeStatus,
  
  // Submission functions
  submitChallenge,
  revokeChallenge,
  approveChallenge,
  
  // Trigger reactivity when storage changes
  refresh: () => storageStore.update((s) => ({})),
};
