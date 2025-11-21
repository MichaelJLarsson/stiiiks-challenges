<script>
  import { onMount } from 'svelte';
  import { authStore } from '../stores/auth.js';
  import { storage } from '../stores/storage.js';
  import CategoryButton from './CategoryButton.svelte';
  import ChallengeItem from './ChallengeItem.svelte';
  import logoUrl from '../../assets/stiiiks-logo.svg';

  let categories = [];
  let selectedCategory = null;
  let currentCategory = null;
  let subcategoryCounters = {};

  onMount(async () => {
    // Check authentication
    if (!$authStore) {
      window.location.href = 'index.html';
      return;
    }

    // Load categories from Supabase
    try {
      categories = await storage.getCategories();
      
      // Select first category by default
      if (categories.length > 0) {
        await selectCategory(categories[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      categories = [];
    }
  });

  async function selectCategory(categoryId) {
    selectedCategory = categoryId;
    try {
      currentCategory = await storage.getCategoryById(categoryId);
      await updateCounters();
    } catch (error) {
      console.error('Error selecting category:', error);
      currentCategory = null;
    }
  }

  async function updateCounters() {
    if (!currentCategory) return;
    
    subcategoryCounters = {};
    for (const subcategory of currentCategory.subcategories) {
      const approvedCount = await countApprovedChallenges(subcategory.challenges);
      subcategoryCounters[subcategory.id] = {
        approved: approvedCount,
        total: subcategory.challenges.length
      };
    }
  }

  async function countApprovedChallenges(challenges) {
    let approvedCount = 0;
    for (const challenge of challenges) {
      try {
        const status = await storage.getChallengeStatus($authStore, challenge.id);
        if (status === 'approved') {
          approvedCount++;
        }
      } catch (error) {
        console.error('Error checking challenge status:', error);
      }
    }
    return approvedCount;
  }

  function handleLogout() {
    authStore.logout();
    window.location.href = 'index.html';
  }

  async function handleChallengeUpdate() {
    await updateCounters();
  }
</script>

<!-- Top bar -->
<div class="top-bar">
  <button class="logout-btn" on:click={handleLogout}>Logout</button>
</div>

<!-- Main content -->
<div class="main-content">
  <!-- Header -->
  <header class="page-header">
    <img src={logoUrl} alt="Stiiiks logo" class="logo">
  </header>

  <!-- Category buttons -->
  <div class="category-section">
    <div class="category-buttons-grid">
      {#each categories as category, i}
        <CategoryButton
          {category}
          count={i + 1}
          selected={selectedCategory === category.id}
          onClick={() => selectCategory(category.id)}
        />
      {/each}
    </div>
    <div class="category-title">
      {#if currentCategory}
        {currentCategory.name}
      {/if}
    </div>
  </div>

  <!-- Challenges container -->
  <div class="challenges-section">
    <div class="challenges-container">
      {#if currentCategory}
        {#each currentCategory.subcategories as subcategory (subcategory.id)}
          <div class="subcategory">
            <div class="subcategory-header">
              <h3 class="subcategory-title">
                {subcategory.name}
              </h3>
              <span class="subcategory-badge">
                {subcategoryCounters[subcategory.id]?.approved || 0}/{subcategoryCounters[subcategory.id]?.total || 0}
              </span>
            </div>
            <div class="challenges-list">
              {#each subcategory.challenges as challenge, index (challenge.id)}
                <div
                  class="challenge-item-wrapper"
                  style={`animation-delay: ${index * 60}ms`}
                >
                  <ChallengeItem {challenge} onUpdate={handleChallengeUpdate} />
                </div>
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
