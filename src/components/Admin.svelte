<script>
  import { onMount } from 'svelte';
  import { authStore } from '../stores/auth.js';
  import { storage } from '../stores/storage.js';

  let pendingSubmissions = [];
  let allSubmissions = [];

  onMount(() => {
    // Check authentication
    if (!$authStore) {
      window.location.href = 'index.html';
      return;
    }

    loadSubmissions();
  });

  function loadSubmissions() {
    const users = storage.getUsers();
    
    pendingSubmissions = [];
    allSubmissions = [];
    
    Object.keys(users).forEach(email => {
      const submissions = users[email].submissions || {};
      Object.keys(submissions).forEach(challengeId => {
        const submission = {
          email,
          challengeId,
          ...submissions[challengeId]
        };
        
        allSubmissions.push(submission);
        
        if (submission.status === 'pending') {
          pendingSubmissions.push(submission);
        }
      });
    });
  }

  function approveSubmission(email, challengeId) {
    storage.approveChallenge(email, challengeId);
    loadSubmissions();
  }

  function rejectSubmission(email, challengeId) {
    const users = storage.getUsers();
    if (users[email] && users[email].submissions[challengeId]) {
      delete users[email].submissions[challengeId];
      localStorage.setItem('stiiiks_users', JSON.stringify(users));
      loadSubmissions();
    }
  }

  function resetSubmission(email, challengeId) {
    const users = storage.getUsers();
    if (users[email] && users[email].submissions[challengeId]) {
      users[email].submissions[challengeId].status = 'pending';
      localStorage.setItem('stiiiks_users', JSON.stringify(users));
      loadSubmissions();
    }
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
  }

  function goToChallenges() {
    window.location.href = 'challenges.html';
  }
</script>

<div class="login-container">
  <div class="login-content">
    <h1 class="stiiiks-title">Admin Panel</h1>
    
    <div class="admin-section">
      <h2>Pending Submissions</h2>
      <div class="submissions-list">
        {#if pendingSubmissions.length === 0}
          <p>No pending submissions.</p>
        {:else}
          {#each pendingSubmissions as submission}
            <div class="submission-item">
              <div class="submission-info">
                <strong>User:</strong> {submission.email}<br>
                <strong>Challenge:</strong> {submission.challengeId}<br>
                <strong>URL:</strong> <a href={submission.url} target="_blank">{submission.url}</a><br>
                <strong>Submitted:</strong> {formatDate(submission.timestamp)}
              </div>
              <div class="submission-actions">
                <button on:click={() => approveSubmission(submission.email, submission.challengeId)} class="approve-btn">Approve</button>
                <button on:click={() => rejectSubmission(submission.email, submission.challengeId)} class="reject-btn">Reject</button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <div class="admin-section">
      <h2>All Submissions</h2>
      <div class="submissions-list">
        {#if allSubmissions.length === 0}
          <p>No submissions yet.</p>
        {:else}
          {#each allSubmissions as submission}
            <div class="submission-item {submission.status}">
              <div class="submission-info">
                <strong>User:</strong> {submission.email}<br>
                <strong>Challenge:</strong> {submission.challengeId}<br>
                <strong>URL:</strong> <a href={submission.url} target="_blank">{submission.url}</a><br>
                <strong>Status:</strong> {submission.status}<br>
                <strong>Submitted:</strong> {formatDate(submission.timestamp)}
              </div>
              <div class="submission-actions">
                {#if submission.status === 'pending'}
                  <button on:click={() => approveSubmission(submission.email, submission.challengeId)} class="approve-btn">Approve</button>
                  <button on:click={() => rejectSubmission(submission.email, submission.challengeId)} class="reject-btn">Reject</button>
                {:else}
                  <button on:click={() => resetSubmission(submission.email, submission.challengeId)} class="reset-btn">Reset</button>
                {/if}
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <button class="challenge-button active" on:click={goToChallenges}>
      Back to Challenges
    </button>
  </div>
</div>

<style>
  .admin-section {
    margin-bottom: 2rem;
    width: 100%;
    max-width: 800px;
  }

  .admin-section h2 {
    color: var(--foreground-color);
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .submissions-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .submission-item {
    background-color: var(--grey-lighter);
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .submission-item.pending {
    border-left: 4px solid var(--orange);
  }

  .submission-item.approved {
    border-left: 4px solid var(--green);
  }

  .submission-info {
    flex: 1;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .submission-info a {
    color: var(--purple);
    word-break: break-all;
  }

  .submission-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .approve-btn, .reject-btn, .reset-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 150ms ease-out;
  }

  .approve-btn {
    background-color: var(--green);
    color: var(--white);
  }

  .approve-btn:hover {
    background-color: #3d8b5f;
  }

  .reject-btn {
    background-color: var(--orange);
    color: var(--white);
  }

  .reject-btn:hover {
    background-color: #e65a00;
  }

  .reset-btn {
    background-color: var(--grey-light);
    color: var(--foreground-color);
  }

  .reset-btn:hover {
    background-color: var(--purple);
    color: var(--white);
  }
</style>
