<script>
  import { onMount } from 'svelte';
  import * as supabaseStore from '../stores/supabaseStore.js';

  // Tab management
  let activeTab = 'dashboard';
  let loading = false;
  let error = null;

  // Dashboard data
  let recentSubmissions = [];
  let stats = {
    total: 0,
    pending: 0,
    approved: 0,
    uniqueUsers: 0,
  };

  // Submissions data
  let allSubmissions = [];
  let submissionsFilter = {
    status: 'all', // 'all', 'pending', 'approved'
    search: '',
    sortBy: 'date_desc',
  };

  // Users data
  let users = [];
  let selectedUser = null;
  let userSubmissions = [];

  // Categories/Challenges data
  let categories = [];
  let expandedCategories = new Set();
  let expandedSubcategories = new Set();

  // Form states
  let showCategoryForm = false;
  let showSubcategoryForm = false;
  let showChallengeForm = false;
  let editingItem = null; // { type: 'category'|'subcategory'|'challenge', data: {...} }
  let formData = {};

  onMount(async () => {
    await loadDashboard();
  });

  // ==================== DASHBOARD FUNCTIONS ====================

  async function loadDashboard() {
    loading = true;
    error = null;
    try {
      [recentSubmissions, stats] = await Promise.all([
        supabaseStore.getRecentSubmissions(20),
        supabaseStore.getSubmissionStats(),
      ]);
    } catch (err) {
      error = err.message || 'Failed to load dashboard data';
      console.error('Error loading dashboard:', err);
    } finally {
      loading = false;
    }
  }

  async function approveSubmissionFromDashboard(submissionId) {
    try {
      await supabaseStore.approveSubmission(submissionId);
      await loadDashboard();
    } catch (err) {
      console.error('Error approving submission:', err);
      alert('Failed to approve submission');
    }
  }

  async function rejectSubmissionFromDashboard(submissionId) {
    if (!confirm('Are you sure you want to reject this submission?')) return;
    try {
      await supabaseStore.rejectSubmission(submissionId);
      await loadDashboard();
    } catch (err) {
      console.error('Error rejecting submission:', err);
      alert('Failed to reject submission');
    }
  }

  // ==================== SUBMISSIONS FUNCTIONS ====================

  async function loadSubmissions() {
    loading = true;
    error = null;
    try {
      const filters = {};
      if (submissionsFilter.status !== 'all') {
        filters.status = submissionsFilter.status;
      }
      if (submissionsFilter.search) {
        filters.search = submissionsFilter.search;
      }
      filters.sortBy = submissionsFilter.sortBy;
      allSubmissions = await supabaseStore.getSubmissions(filters);
    } catch (err) {
      error = err.message || 'Failed to load submissions';
      console.error('Error loading submissions:', err);
    } finally {
      loading = false;
    }
  }

  async function approveSubmission(submissionId) {
    try {
      await supabaseStore.approveSubmission(submissionId);
      await loadSubmissions();
      await loadDashboard();
    } catch (err) {
      console.error('Error approving submission:', err);
      alert('Failed to approve submission');
    }
  }

  async function rejectSubmission(submissionId) {
    if (!confirm('Are you sure you want to reject this submission?')) return;
    try {
      await supabaseStore.rejectSubmission(submissionId);
      await loadSubmissions();
      await loadDashboard();
    } catch (err) {
      console.error('Error rejecting submission:', err);
      alert('Failed to reject submission');
    }
  }

  async function resetSubmission(submissionId) {
    try {
      await supabaseStore.resetSubmission(submissionId);
      await loadSubmissions();
      await loadDashboard();
    } catch (err) {
      console.error('Error resetting submission:', err);
      alert('Failed to reset submission');
    }
  }

  function handleFilterChange() {
    loadSubmissions();
  }

  // ==================== USERS FUNCTIONS ====================

  async function loadUsers() {
    loading = true;
    error = null;
    try {
      users = await supabaseStore.getUsers();
      // Load submission counts for each user
      for (const user of users) {
        const userSubs = await supabaseStore.getUserSubmissions(user.email);
        user.submissionCount = userSubs.length;
        user.pendingCount = userSubs.filter((s) => s.status === 'pending').length;
        user.approvedCount = userSubs.filter((s) => s.status === 'approved').length;
      }
    } catch (err) {
      error = err.message || 'Failed to load users';
      console.error('Error loading users:', err);
    } finally {
      loading = false;
    }
  }

  async function selectUser(user) {
    selectedUser = user;
    try {
      userSubmissions = await supabaseStore.getUserSubmissions(user.email);
    } catch (err) {
      console.error('Error loading user submissions:', err);
      userSubmissions = [];
    }
  }

  function goBackToUsers() {
    selectedUser = null;
    userSubmissions = [];
  }

  // ==================== CATEGORIES/CHALLENGES FUNCTIONS ====================

  async function loadCategories() {
    loading = true;
    error = null;
    try {
      categories = await supabaseStore.getCategories();
    } catch (err) {
      error = err.message || 'Failed to load categories';
      console.error('Error loading categories:', err);
    } finally {
      loading = false;
    }
  }

  function toggleCategory(categoryId) {
    if (expandedCategories.has(categoryId)) {
      expandedCategories.delete(categoryId);
    } else {
      expandedCategories.add(categoryId);
    }
  }

  function toggleSubcategory(subcategoryId) {
    if (expandedSubcategories.has(subcategoryId)) {
      expandedSubcategories.delete(subcategoryId);
    } else {
      expandedSubcategories.add(subcategoryId);
    }
  }

  function openCategoryForm(category = null) {
    editingItem = category ? { type: 'category', data: category } : null;
    formData = category
      ? { name: category.name, icon: category.icon, order_index: category.order_index }
      : { name: '', icon: '', order_index: 0 };
    showCategoryForm = true;
  }

  function openSubcategoryForm(subcategory = null, categoryId = null) {
    editingItem = subcategory ? { type: 'subcategory', data: subcategory, categoryId } : { categoryId };
    formData = subcategory
      ? { name: subcategory.name, order_index: subcategory.order_index }
      : { name: '', order_index: 0 };
    showSubcategoryForm = true;
  }

  function openChallengeForm(challenge = null, subcategoryId = null) {
    editingItem = challenge ? { type: 'challenge', data: challenge, subcategoryId } : { subcategoryId };
    formData = challenge ? { title: challenge.title, order_index: challenge.order_index } : { title: '', order_index: 0 };
    showChallengeForm = true;
  }

  function closeForms() {
    showCategoryForm = false;
    showSubcategoryForm = false;
    showChallengeForm = false;
    editingItem = null;
    formData = {};
  }

  async function saveCategory() {
    try {
      if (editingItem && editingItem.type === 'category') {
        await supabaseStore.updateCategory(editingItem.data.id, formData);
      } else {
        await supabaseStore.createCategory(formData);
      }
      closeForms();
      await loadCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Failed to save category');
    }
  }

  async function saveSubcategory() {
    try {
      const categoryId = editingItem?.categoryId || editingItem?.data?.category_id;
      if (editingItem?.type === 'subcategory') {
        await supabaseStore.updateSubcategory(editingItem.data.id, formData);
      } else {
        await supabaseStore.createSubcategory(categoryId, formData);
      }
      closeForms();
      await loadCategories();
    } catch (err) {
      console.error('Error saving subcategory:', err);
      alert('Failed to save subcategory');
    }
  }

  async function saveChallenge() {
    try {
      const subcategoryId = editingItem?.subcategoryId || editingItem?.data?.subcategory_id;
      if (editingItem?.type === 'challenge') {
        await supabaseStore.updateChallenge(editingItem.data.id, formData);
      } else {
        await supabaseStore.createChallenge(subcategoryId, formData);
      }
      closeForms();
      await loadCategories();
    } catch (err) {
      console.error('Error saving challenge:', err);
      alert('Failed to save challenge');
    }
  }

  async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category? This will also delete all subcategories and challenges.')) return;
    try {
      await supabaseStore.deleteCategory(categoryId);
      await loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category');
    }
  }

  async function deleteSubcategory(subcategoryId) {
    if (!confirm('Are you sure you want to delete this subcategory? This will also delete all challenges.')) return;
    try {
      await supabaseStore.deleteSubcategory(subcategoryId);
      await loadCategories();
    } catch (err) {
      console.error('Error deleting subcategory:', err);
      alert('Failed to delete subcategory');
    }
  }

  async function deleteChallenge(challengeId) {
    if (!confirm('Are you sure you want to delete this challenge?')) return;
    try {
      await supabaseStore.deleteChallenge(challengeId);
      await loadCategories();
    } catch (err) {
      console.error('Error deleting challenge:', err);
      alert('Failed to delete challenge');
    }
  }

  // ==================== TAB MANAGEMENT ====================

  function switchTab(tab) {
    activeTab = tab;
    if (tab === 'submissions') {
      loadSubmissions();
    } else if (tab === 'users') {
      loadUsers();
    } else if (tab === 'challenges') {
      loadCategories();
    } else if (tab === 'dashboard') {
      loadDashboard();
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  }

  function getChallengeTitle(submission) {
    if (submission.challenge && typeof submission.challenge === 'object') {
      return submission.challenge.title || 'Unknown Challenge';
    }
    return 'Unknown Challenge';
  }

  function getCategoryName(submission) {
    if (submission.challenge?.subcategory?.category) {
      return submission.challenge.subcategory.category.name;
    }
    return 'Unknown';
  }
</script>

<div class="login-container">
  <div class="login-content">
    <h1 class="stiiiks-title">Admin Panel</h1>

    {#if error}
      <div class="error-message">{error}</div>
    {/if}

    <!-- Tab Navigation -->
    <div class="admin-tabs">
      <button class="admin-tab {activeTab === 'dashboard' ? 'active' : ''}" on:click={() => switchTab('dashboard')}>
        Dashboard
      </button>
      <button class="admin-tab {activeTab === 'submissions' ? 'active' : ''}" on:click={() => switchTab('submissions')}>
        Submissions
      </button>
      <button class="admin-tab {activeTab === 'users' ? 'active' : ''}" on:click={() => switchTab('users')}>
        Users
      </button>
      <button class="admin-tab {activeTab === 'challenges' ? 'active' : ''}" on:click={() => switchTab('challenges')}>
        Challenges
      </button>
    </div>

    <!-- Dashboard Tab -->
    {#if activeTab === 'dashboard'}
      <div class="admin-section">
        <h2>Dashboard</h2>
        
        {#if loading}
          <p>Loading...</p>
        {:else}
          <!-- Stats Cards -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{stats.total}</div>
              <div class="stat-label">Total Submissions</div>
            </div>
            <div class="stat-card pending">
              <div class="stat-value">{stats.pending}</div>
              <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card approved">
              <div class="stat-value">{stats.approved}</div>
              <div class="stat-label">Approved</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{stats.uniqueUsers}</div>
              <div class="stat-label">Unique Users</div>
            </div>
          </div>

          <!-- Recent Submissions -->
          <h3>Recent Submissions</h3>
          <div class="submissions-list">
            {#if recentSubmissions.length === 0}
              <p>No submissions yet.</p>
            {:else}
              {#each recentSubmissions as submission}
                <div class="submission-item {submission.status}">
                  <div class="submission-info">
                    <strong>User:</strong> {submission.user?.email || 'Unknown'}<br>
                    <strong>Challenge:</strong> {getChallengeTitle(submission)}<br>
                    <strong>Category:</strong> {getCategoryName(submission)}<br>
                    <strong>URL:</strong> <a href={submission.url} target="_blank" rel="noopener noreferrer">{submission.url}</a><br>
                    <strong>Status:</strong> {submission.status}<br>
                    <strong>Submitted:</strong> {formatDate(submission.created_at)}
                  </div>
                  <div class="submission-actions">
                    {#if submission.status === 'pending'}
                      <button on:click={() => approveSubmissionFromDashboard(submission.id)} class="approve-btn">Approve</button>
                      <button on:click={() => rejectSubmissionFromDashboard(submission.id)} class="reject-btn">Reject</button>
                    {:else}
                      <button on:click={() => resetSubmission(submission.id)} class="reset-btn">Reset</button>
                    {/if}
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Submissions Tab -->
    {#if activeTab === 'submissions'}
      <div class="admin-section">
        <h2>All Submissions</h2>

        <!-- Filters -->
        <div class="filters">
          <select bind:value={submissionsFilter.status} on:change={handleFilterChange}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
          <input
            type="text"
            placeholder="Search by URL, user, or challenge..."
            bind:value={submissionsFilter.search}
            on:input={handleFilterChange}
          />
          <select bind:value={submissionsFilter.sortBy} on:change={handleFilterChange}>
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="user">Sort by User</option>
          </select>
        </div>

        {#if loading}
          <p>Loading...</p>
        {:else}
          <div class="submissions-list">
            {#if allSubmissions.length === 0}
              <p>No submissions found.</p>
            {:else}
              {#each allSubmissions as submission}
                <div class="submission-item {submission.status}">
                  <div class="submission-info">
                    <strong>User:</strong> {submission.user?.email || 'Unknown'}<br>
                    <strong>Challenge:</strong> {getChallengeTitle(submission)}<br>
                    <strong>Category:</strong> {getCategoryName(submission)}<br>
                    <strong>URL:</strong> <a href={submission.url} target="_blank" rel="noopener noreferrer">{submission.url}</a><br>
                    <strong>Status:</strong> {submission.status}<br>
                    <strong>Submitted:</strong> {formatDate(submission.created_at)}
                  </div>
                  <div class="submission-actions">
                    {#if submission.status === 'pending'}
                      <button on:click={() => approveSubmission(submission.id)} class="approve-btn">Approve</button>
                      <button on:click={() => rejectSubmission(submission.id)} class="reject-btn">Reject</button>
                    {:else}
                      <button on:click={() => resetSubmission(submission.id)} class="reset-btn">Reset</button>
                    {/if}
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Users Tab -->
    {#if activeTab === 'users'}
      <div class="admin-section">
        {#if !selectedUser}
          <h2>Users</h2>
          {#if loading}
            <p>Loading...</p>
          {:else}
            <div class="users-list">
              {#if users.length === 0}
                <p>No users yet.</p>
              {:else}
                <table class="users-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Total Submissions</th>
                      <th>Pending</th>
                      <th>Approved</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each users as user}
                      <tr>
                        <td>{user.email}</td>
                        <td>{user.submissionCount || 0}</td>
                        <td>{user.pendingCount || 0}</td>
                        <td>{user.approvedCount || 0}</td>
                        <td>
                          <button on:click={() => selectUser(user)} class="view-btn">View Submissions</button>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              {/if}
            </div>
          {/if}
        {:else}
          <div class="user-detail">
            <button on:click={goBackToUsers} class="back-btn">← Back to Users</button>
            <h2>Submissions for {selectedUser.email}</h2>
            <div class="submissions-list">
              {#if userSubmissions.length === 0}
                <p>No submissions for this user.</p>
              {:else}
                {#each userSubmissions as submission}
                  <div class="submission-item {submission.status}">
                    <div class="submission-info">
                      <strong>Challenge:</strong> {getChallengeTitle(submission)}<br>
                      <strong>Category:</strong> {getCategoryName(submission)}<br>
                      <strong>URL:</strong> <a href={submission.url} target="_blank" rel="noopener noreferrer">{submission.url}</a><br>
                      <strong>Status:</strong> {submission.status}<br>
                      <strong>Submitted:</strong> {formatDate(submission.created_at)}
                    </div>
                    <div class="submission-actions">
                      {#if submission.status === 'pending'}
                        <button on:click={() => approveSubmission(submission.id)} class="approve-btn">Approve</button>
                        <button on:click={() => rejectSubmission(submission.id)} class="reject-btn">Reject</button>
                      {:else}
                        <button on:click={() => resetSubmission(submission.id)} class="reset-btn">Reset</button>
                      {/if}
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Challenges Tab -->
    {#if activeTab === 'challenges'}
      <div class="admin-section">
        <h2>Challenges & Categories</h2>
        <button on:click={() => openCategoryForm()} class="add-btn">+ Add Category</button>

        {#if loading}
          <p>Loading...</p>
        {:else}
          <div class="categories-list">
            {#if categories.length === 0}
              <p>No categories yet. Create one to get started!</p>
            {:else}
              {#each categories as category}
                <div class="category-item">
                  <div class="category-header">
                    <button class="expand-btn" on:click={() => toggleCategory(category.id)}>
                      {expandedCategories.has(category.id) ? '▼' : '▶'}
                    </button>
                    <span class="category-name">{category.name}</span>
                    <span class="category-icon">{category.icon}</span>
                    <button on:click={() => openCategoryForm(category)} class="edit-btn">Edit</button>
                    <button on:click={() => deleteCategory(category.id)} class="delete-btn">Delete</button>
                  </div>
                  {#if expandedCategories.has(category.id)}
                    <div class="subcategories-list">
                      <button on:click={() => openSubcategoryForm(null, category.id)} class="add-btn small">+ Add Subcategory</button>
                      {#each category.subcategories || [] as subcategory}
                        <div class="subcategory-item">
                          <div class="subcategory-header">
                            <button class="expand-btn" on:click={() => toggleSubcategory(subcategory.id)}>
                              {expandedSubcategories.has(subcategory.id) ? '▼' : '▶'}
                            </button>
                            <span class="subcategory-name">{subcategory.name}</span>
                            <button on:click={() => openSubcategoryForm(subcategory, category.id)} class="edit-btn">Edit</button>
                            <button on:click={() => deleteSubcategory(subcategory.id)} class="delete-btn">Delete</button>
                          </div>
                          {#if expandedSubcategories.has(subcategory.id)}
                            <div class="challenges-list">
                              <button on:click={() => openChallengeForm(null, subcategory.id)} class="add-btn small">+ Add Challenge</button>
                              {#each subcategory.challenges || [] as challenge}
                                <div class="challenge-item">
                                  <span class="challenge-title">{challenge.title}</span>
                                  <button on:click={() => openChallengeForm(challenge, subcategory.id)} class="edit-btn">Edit</button>
                                  <button on:click={() => deleteChallenge(challenge.id)} class="delete-btn">Delete</button>
                                </div>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Forms -->
    {#if showCategoryForm}
      <div class="modal-overlay" on:click={closeForms} role="button" tabindex="0" on:keyup={(e) => e.key === 'Enter' && closeForms()}>
        <div class="modal-content" on:click|stopPropagation role="button" tabindex="0" on:keyup={(e) => e.key === 'Enter' && closeForms()}>
          <h3>{editingItem?.type === 'category' ? 'Edit' : 'Add'} Category</h3>
          <div class="form-group">
            <label for="user-name">Name</label>
            <input type="text" id="user-name" bind:value={formData.name} />
          </div>
          <div class="form-group">
            <label for="user-icon">Icon</label>
            <input type="text" id="user-icon" bind:value={formData.icon} placeholder="checklist-stroke" />
          </div>
          <div class="form-group">
            <label for="user-order">Order</label>
            <input type="number" id="user-order" bind:value={formData.order_index} />
          </div>
          <div class="form-actions">
            <button on:click={saveCategory} class="save-btn">Save</button>
            <button on:click={closeForms} class="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    {/if}

    {#if showSubcategoryForm}
      <div class="modal-overlay" on:click={closeForms} role="button" tabindex="0" on:keyup={(e) => e.key === 'Enter' && closeForms()}>
        <div class="modal-content" on:click|stopPropagation role="button" tabindex="0" on:keyup={(e) => e.key === 'Enter' && closeForms()}>
          <h3>{editingItem?.type === 'subcategory' ? 'Edit' : 'Add'} Subcategory</h3>
          <div class="form-group">
            <label for="subcategory-name">Name</label>
            <input type="text" id="subcategory-name" bind:value={formData.name} />
          </div>
          <div class="form-group">
            <label for="subcategory-order">Order</label>
            <input type="number" id="subcategory-order" bind:value={formData.order_index} />
          </div>
          <div class="form-actions">
            <button on:click={saveSubcategory} class="save-btn">Save</button>
            <button on:click={closeForms} class="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    {/if}

    {#if showChallengeForm}
      <div class="modal-overlay" on:click={closeForms} role="button" tabindex="0" on:keyup={(e) => e.key === 'Enter' && closeForms()}>
        <div class="modal-content" on:click|stopPropagation role="button" tabindex="0" on:keyup={(e) => e.key === 'Enter' && closeForms()}>
          <h3>{editingItem?.type === 'challenge' ? 'Edit' : 'Add'} Challenge</h3>
          <div class="form-group">
            <label for="challenge-title">Title</label>
            <input type="text" id="challenge-title" bind:value={formData.title} />
          </div>
          <div class="form-group">
            <label for="challenge-order">Order</label>
            <input type="number" id="challenge-order" bind:value={formData.order_index} />
          </div>
          <div class="form-actions">
            <button on:click={saveChallenge} class="save-btn">Save</button>
            <button on:click={closeForms} class="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    {/if}

    <button class="challenge-button active" on:click={() => window.location.href = 'challenges.html'}>
      Back to Challenges
    </button>
  </div>
</div>

<style>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .login-content {
    width: 100%;
    max-width: 1200px;
    background-color: var(--background-color);
    padding: 2rem;
    border-radius: 12px;
  }

  .stiiiks-title {
    color: var(--foreground-color);
    margin-bottom: 2rem;
    font-size: 2rem;
  }

  .error-message {
    background-color: var(--orange);
    color: var(--white);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .admin-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 2px solid var(--grey-light);
  }

  .admin-tab {
    padding: 0.75rem 1.5rem;
    border: none;
    background: none;
    color: var(--foreground-color);
    cursor: pointer;
    font-size: 1rem;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: all 150ms ease-out;
  }

  .admin-tab:hover {
    color: var(--purple);
  }

  .admin-tab.active {
    color: var(--purple);
    border-bottom-color: var(--purple);
    font-weight: 600;
  }

  .admin-section {
    margin-bottom: 2rem;
  }

  .admin-section h2 {
    color: var(--foreground-color);
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .admin-section h3 {
    color: var(--foreground-color);
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background-color: var(--grey-lighter);
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
  }

  .stat-card.pending {
    border-left: 4px solid var(--orange);
  }

  .stat-card.approved {
    border-left: 4px solid var(--green);
  }

  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: var(--foreground-color);
    margin-bottom: 0.5rem;
  }

  .stat-label {
    color: var(--grey);
    font-size: 0.875rem;
  }

  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .filters select,
  .filters input {
    padding: 0.5rem;
    border: 1px solid var(--grey-light);
    border-radius: 6px;
    background-color: var(--background-color);
    color: var(--foreground-color);
    font-size: 0.875rem;
  }

  .filters input {
    flex: 1;
    min-width: 200px;
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
    line-height: 1.6;
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

  .approve-btn,
  .reject-btn,
  .reset-btn {
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

  .users-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--grey-light);
  }

  .users-table th {
    background-color: var(--grey-lighter);
    font-weight: 600;
    color: var(--foreground-color);
  }

  .view-btn,
  .back-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    background-color: var(--purple);
    color: var(--white);
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 150ms ease-out;
  }

  .view-btn:hover,
  .back-btn:hover {
    background-color: #6b5fa8;
  }

  .back-btn {
    margin-bottom: 1rem;
  }

  .categories-list {
    margin-top: 1rem;
  }

  .category-item,
  .subcategory-item {
    margin-bottom: 1rem;
    border: 1px solid var(--grey-light);
    border-radius: 8px;
    padding: 1rem;
  }

  .category-header,
  .subcategory-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .expand-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--foreground-color);
    font-size: 0.875rem;
    padding: 0.25rem;
  }

  .category-name,
  .subcategory-name {
    flex: 1;
    font-weight: 600;
    color: var(--foreground-color);
  }

  .category-icon {
    color: var(--grey);
    font-size: 0.875rem;
  }

  .challenge-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    margin-left: 2rem;
    border-left: 2px solid var(--grey-light);
  }

  .challenge-title {
    flex: 1;
    color: var(--foreground-color);
  }

  .add-btn,
  .edit-btn,
  .delete-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 150ms ease-out;
  }

  .add-btn {
    background-color: var(--green);
    color: var(--white);
    margin-bottom: 1rem;
  }

  .add-btn:hover {
    background-color: #3d8b5f;
  }

  .add-btn.small {
    margin-bottom: 0.5rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }

  .edit-btn {
    background-color: var(--purple);
    color: var(--white);
  }

  .edit-btn:hover {
    background-color: #6b5fa8;
  }

  .delete-btn {
    background-color: var(--orange);
    color: var(--white);
  }

  .delete-btn:hover {
    background-color: #e65a00;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: var(--background-color);
    padding: 2rem;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-content h3 {
    margin-bottom: 1.5rem;
    color: var(--foreground-color);
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--foreground-color);
    font-weight: 500;
  }

  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--grey-light);
    border-radius: 6px;
    background-color: var(--background-color);
    color: var(--foreground-color);
    font-size: 1rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  .save-btn,
  .cancel-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 150ms ease-out;
  }

  .save-btn {
    background-color: var(--green);
    color: var(--white);
  }

  .save-btn:hover {
    background-color: #3d8b5f;
  }

  .cancel-btn {
    background-color: var(--grey-light);
    color: var(--foreground-color);
  }

  .cancel-btn:hover {
    background-color: var(--grey);
    color: var(--white);
  }

  .challenge-button {
    margin-top: 2rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    background-color: var(--purple);
    color: var(--white);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 150ms ease-out;
  }

  .challenge-button:hover {
    background-color: #6b5fa8;
  }
</style>
