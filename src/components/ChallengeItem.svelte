<script>
  import { authStore } from '../stores/auth.js';
  import { storage } from '../stores/storage.js';
  import { onMount } from 'svelte';
  import { loadSvgs } from '../lib/svgLoader.js';

  export let challenge;
  export let onUpdate;

  let submission = null;
  let inputValue = '';
  let isExpanded = false;
  let clockSvg = '';
  let checklistSvg = '';
  let chevronSvg = '';

  $: status = submission ? submission.status : null;
  $: stateClass = getStateClass(status);
  
  onMount(async () => {
    // Load icons using the reusable SVG loader utility
    const svgs = await loadSvgs([
      { name: 'clock-stroke', className: 'status-icon' },
      { name: 'checklist-stroke', className: 'status-icon' },
      { name: 'chevron-down', className: 'chevron-icon' }
    ]);
    
    clockSvg = svgs['clock-stroke'];
    checklistSvg = svgs['checklist-stroke'];
    chevronSvg = svgs['chevron-down'];
    
    updateSubmission();
  });

  function updateSubmission() {
    submission = storage.getChallengeSubmission($authStore, challenge.id);
    if (submission) {
      inputValue = submission.url;
    }
  }

  function getStateClass(status) {
    switch (status) {
      case 'pending':
        return 'submitted';
      case 'approved':
        return 'approved';
      default:
        return 'default';
    }
  }

  function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  function handleInput(e) {
    inputValue = e.target.value;
  }

  function handleBlur() {
    if (isValidUrl(inputValue.trim())) {
      submitUrl();
    }
  }

  function submitUrl() {
    if (isValidUrl(inputValue.trim())) {
      storage.submitChallenge($authStore, challenge.id, inputValue.trim());
      updateSubmission();
      isExpanded = false;
      if (onUpdate) onUpdate();
    }
  }

  function handleRevoke() {
    // Clear the submission
    storage.revokeChallenge($authStore, challenge.id);
    inputValue = '';
    updateSubmission();
    isExpanded = false;
    if (onUpdate) onUpdate();
  }

  function toggleExpand() {
    if (!submission) {
      isExpanded = !isExpanded;
    }
  }

  function handleTitleClick() {
    if (!submission) {
      toggleExpand();
    }
  }
</script>

<div class="challenge-item" data-challenge-id={challenge.id}>
  <div class="challenge-bar {stateClass}" class:expanded={isExpanded}>
    <div 
      class="challenge-header" 
      on:click={handleTitleClick}
      on:keydown={(e) => e.key === 'Enter' && handleTitleClick()}
      role="button"
      tabindex="0"
    >
      <div class="challenge-icon" class:rotated={isExpanded && !submission}>
        {#if status === 'approved'}
          {@html checklistSvg}
        {:else if status === 'pending'}
          {@html clockSvg}
        {:else}
          {@html chevronSvg}
        {/if}
      </div>
      <h4 class="challenge-title">{challenge.title}</h4>
    </div>
    
    {#if isExpanded && !submission}
      <div class="challenge-input-container">
        <input 
          type="url" 
          class="challenge-input" 
          placeholder="Drop your Instagram or TikTok link here (Accept our follow so we can view your content)"
          value={inputValue}
          on:input={handleInput}
          on:blur={handleBlur}
        />
      </div>
    {:else if submission}
      <div class="challenge-details">
        <div class="challenge-url">
          <span class="url-icon">🔗</span>
          <span class="url-text">{submission.url}</span>
        </div>
        <button class="revoke-btn" on:click={handleRevoke}>Revoke</button>
      </div>
    {/if}
  </div>
</div>
