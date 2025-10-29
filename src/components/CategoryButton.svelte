<script>
  import { onMount } from 'svelte';

  export let category;
  export let count;
  export let selected = false;
  export let onClick;

  let svgContent = '';

  onMount(async () => {
    try {
      const response = await fetch(`./assets/${category.icon}.svg`);
      if (response.ok) {
        let svg = await response.text();
        svg = svg.replace('<svg', '<svg class="category-icon"');
        svgContent = svg;
      }
    } catch (error) {
      console.error(`Error loading SVG ${category.icon}:`, error);
    }
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
