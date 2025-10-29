<script>
  import { onMount } from 'svelte';
  import { loadSvg } from '../lib/svgLoader.js';

  export let category;
  export let count;
  export let selected = false;
  export let onClick;

  let svgContent = '';

  onMount(async () => {
    svgContent = await loadSvg(category.icon, 'category-icon');
  });
</script>

<button
  class="category-button"
  class:selected
  data-category-id={category.id}
  aria-label={category.name}
  data-count={count}
  on:click={onClick}
>
  <div class="icon">
    {@html svgContent}
  </div>
</button>
