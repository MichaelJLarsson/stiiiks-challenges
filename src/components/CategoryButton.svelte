<script>
  import { onMount } from 'svelte';

  export let category;
  export let count;
  export let selected = false;
  export let onClick;

  let svgContent = '';

  onMount(async () => {
    // Use dynamic import with ?raw query for Vite to handle SVG as text
    // This is Vite's native way and doesn't require external plugins
    try {
      const svgModule = await import(`../../assets/${category.icon}.svg?raw`);
      let svg = svgModule.default;
      svg = svg.replace('<svg', '<svg class="category-icon"');
      svgContent = svg;
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
