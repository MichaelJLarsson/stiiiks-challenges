<script>
  import { authStore } from '../stores/auth.js';
  import { onMount } from 'svelte';
  import logoUrl from '../../assets/stiiiks-logo.svg';

  let email = '';
  let password = '';
  
  $: buttonDisabled = !email.trim() || !password;

  function handleSubmit(e) {
    e.preventDefault();
    
    if (email.trim() && password) {
      authStore.login(email.trim(), password);
      window.location.href = 'challenges.html';
    }
  }

  onMount(() => {
    // Redirect if already authenticated
    if ($authStore) {
      window.location.href = 'challenges.html';
    }
  });
</script>

<div class="login-container">
  <!-- Top bar -->
  <div class="top-bar">
    <a href="#top" class="back-to-shop">Go back to shop</a>
  </div>

  <!-- Main content -->
  <div class="login-content">
    <img src={logoUrl} alt="Stiiiks logo" class="logo">
    <p class="tagline">We turned your emotional damage into a game of challenges.</p>

    <form class="login-form" on:submit={handleSubmit}>
      <div class="input-group">
        <input 
          type="email" 
          bind:value={email}
          placeholder="Email" 
          required 
          class="input-field"
        />
      </div>
      
      <div class="input-group">
        <input 
          type="password" 
          bind:value={password}
          placeholder="Password" 
          required 
          class="input-field"
        />
      </div>

      <button type="submit" class="challenge-button" disabled={buttonDisabled}>
        Challenge Accepted
      </button>
    </form>

    <!-- Footer links -->
    <div class="footer-links">
      <a href="#top" class="footer-link">Terms of Service</a>
      <span class="separator">•</span>
      <a href="#top" class="footer-link">Privacy Policy</a>
    </div>

    <div class="login-link">
      <p>Already have an account? <a href="#top" class="login-text-link">Log in</a></p>
    </div>
  </div>
</div>
