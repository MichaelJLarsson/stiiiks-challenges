<script>
  import { authStore } from '../stores/auth.js';
  import { storage } from '../stores/storage.js';
  import { onMount } from 'svelte';
  import { loadSvgs } from '../lib/svgLoader.js';

  export let challenge;
  export let onUpdate;

  let submission = null;
  let inputValue = '';
  let showInput = false;
  let clockSvg = '';
  let checklistSvg = '';

  $: status = submission ? submission.status : null;
  $: stateClass = getStateClass(status);
  
  onMount(async () => {
    // Load status icons using the reusable SVG loader utility
    const svgs = await loadSvgs([
      { name: 'clock-stroke', className: 'status-icon' },
      { name: 'checklist-stroke', className: 'status-icon' }
    ]);
    
    clockSvg = svgs['clock-stroke'];
    checklistSvg = svgs['checklist-stroke'];
    
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
      showInput = false;
      if (onUpdate) onUpdate();
    }
  }

  function handleEdit() {
    showInput = true;
    inputValue = submission ? submission.url : '';
  }
</script>

<div class="challenge-item" data-challenge-id={challenge.id}>
  <div class="challenge-bar {stateClass}">
    <div class="challenge-content">
      <h4 class="challenge-title">{challenge.title}</h4>
      
      {#if !submission || showInput}
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
      {:else if submission.status === 'pending'}
        <div class="challenge-submitted">
          <div class="challenge-url">
            <span class="url-text">{submission.url}</span>
            <button class="edit-url-btn" on:click={handleEdit}>Edit</button>
          </div>
          <div class="status-indicator pending">
            {@html clockSvg}
            <span>Pending</span>
          </div>
        </div>
      {:else if submission.status === 'approved'}
        <div class="challenge-approved">
          <div class="challenge-url">
            <span class="url-text">{submission.url}</span>
            <button class="edit-url-btn" on:click={handleEdit}>Edit</button>
          </div>
          <div class="status-indicator approved">
            {@html checklistSvg}
            <span>Approved</span>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
