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
  let clockPendingSvg = '';
  let checkboxSvg = '';
  let chevronSvg = '';
  let chainSvg = '';

  $: status = submission ? submission.status : null;
  $: stateClass = getStateClass(status);
  
  onMount(async () => {
    // Load icons using the reusable SVG loader utility
    const svgs = await loadSvgs([
      { name: 'clock-pending-stroke', className: 'status-icon' },
      { name: 'checkbox-stroke', className: 'status-icon' },
      { name: 'chevron-down', className: 'chevron-icon' },
      { name: 'chain-stroke', className: 'chain-icon' }
    ]);
    
    clockPendingSvg = svgs['clock-pending-stroke'];
    checkboxSvg = svgs['checkbox-stroke'];
    chevronSvg = svgs['chevron-down'];
    chainSvg = svgs['chain-stroke'];
    
    updateSubmission();
  });

  async function updateSubmission() {
    try {
      submission = await storage.getChallengeSubmission($authStore, challenge.id);
      if (submission) {
        inputValue = submission.url;
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      submission = null;
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

  async function submitUrl() {
    if (isValidUrl(inputValue.trim())) {
      try {
        await storage.submitChallenge($authStore, challenge.id, inputValue.trim());
        await updateSubmission();
        isExpanded = false;
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error submitting challenge:', error);
        alert('Failed to submit challenge. Please try again.');
      }
    }
  }

  async function handleRevoke() {
    // Clear the submission
    try {
      await storage.revokeChallenge($authStore, challenge.id);
      inputValue = '';
      await updateSubmission();
      isExpanded = false;
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error revoking challenge:', error);
      alert('Failed to revoke challenge. Please try again.');
    }
  }

  function toggleExpand() {
    isExpanded = !isExpanded;
  }

  function handleTitleClick() {
    toggleExpand();
  }
</script>

<div class="challenge-item {stateClass}" data-challenge-id={challenge.id}>
  <div class="challenge-bar {stateClass}" class:expanded={isExpanded}>
    <div 
      class="challenge-header" 
      on:click={handleTitleClick}
      on:keydown={(e) => e.key === 'Enter' && handleTitleClick()}
      role="button"
      tabindex="0"
    >
      <div class="challenge-icon-left" class:rotated={isExpanded}>
        {@html chevronSvg}
      </div>
      <h4 class="challenge-title">{challenge.title}</h4>
      {#if submission}
        <div class="challenge-icon-right status-icon-circle" class:submitted={status === 'pending'} class:approved={status === 'approved'}>
          {#if status === 'approved'}
            {@html checkboxSvg}
          {:else if status === 'pending'}
            {@html clockPendingSvg}
          {/if}
        </div>
      {/if}
    </div>
    
    {#if !submission}
      <div class="challenge-input-container">
        {@html chainSvg}
        <input
          name="challenge-url"
          type="url" 
          class="challenge-input" 
          placeholder="Drop your Instagram or TikTok link here (Accept our follow so we can view your content)"
          value={inputValue}
          on:input={handleInput}
          on:blur={handleBlur}
        />
        <button 
          class="submit-btn" 
          on:click={submitUrl}
        >
          Submit
        </button>
      </div>
    {/if}
    {#if submission}
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
