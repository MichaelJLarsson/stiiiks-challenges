/**
 * Utility function to load SVG files using Vite's native ?raw import
 * This approach:
 * - Processes SVGs at build time (not runtime)
 * - Creates optimized chunks for each SVG
 * - No external plugins needed
 * 
 * @param {string} iconName - Name of the SVG file (without .svg extension)
 * @param {string} className - Optional CSS class to add to the SVG element
 * @returns {Promise<string>} SVG content as HTML string
 */
export async function loadSvg(iconName, className = '') {
  try {
    const svgModule = await import(`../../assets/${iconName}.svg?raw`);
    let svg = svgModule.default;
    
    // Add class to SVG if provided
    if (className) {
      svg = svg.replace('<svg', `<svg class="${className}"`);
    }
    
    // For chevron icons, ensure the path has a fill attribute
    if (iconName.includes('chevron')) {
      svg = svg.replace('<path d=', '<path fill="black" d=');
    }
    
    return svg;
  } catch (error) {
    console.error(`Error loading SVG ${iconName}:`, error);
    return '';
  }
}

/**
 * Load multiple SVG files in parallel
 * 
 * @param {Array<{name: string, className?: string}>} svgs - Array of SVG configs
 * @returns {Promise<Object>} Object with SVG names as keys and content as values
 */
export async function loadSvgs(svgs) {
  const results = await Promise.all(
    svgs.map(async ({ name, className = '' }) => {
      const content = await loadSvg(name, className);
      return { name, content };
    })
  );
  
  return results.reduce((acc, { name, content }) => {
    acc[name] = content;
    return acc;
  }, {});
}
