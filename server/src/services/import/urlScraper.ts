import * as cheerio from 'cheerio';
import { normalizeRecipe } from './recipeParser';
import type { ParsedRecipe } from './recipeParser';

export async function scrapeUrl(url: string): Promise<ParsedRecipe> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; BakeBuddy/1.0)',
      'Accept': 'text/html',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Find JSON-LD script tags
  const jsonLdScripts = $('script[type="application/ld+json"]');
  let recipeData: any = null;

  jsonLdScripts.each((_, el) => {
    try {
      const content = $(el).html();
      if (!content) return;

      let data = JSON.parse(content);

      // Handle @graph arrays
      if (data['@graph']) {
        data = data['@graph'];
      }

      // Handle arrays
      if (Array.isArray(data)) {
        const found = data.find((item: any) =>
          item['@type'] === 'Recipe' ||
          (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))
        );
        if (found) recipeData = found;
      } else if (
        data['@type'] === 'Recipe' ||
        (Array.isArray(data['@type']) && data['@type'].includes('Recipe'))
      ) {
        recipeData = data;
      }
    } catch {
      // Invalid JSON, skip
    }
  });

  if (!recipeData) {
    throw new Error('No recipe JSON-LD data found on this page');
  }

  // Extract image URL
  let imageUrl: string | undefined;
  if (recipeData.image) {
    if (typeof recipeData.image === 'string') {
      imageUrl = recipeData.image;
    } else if (Array.isArray(recipeData.image)) {
      imageUrl = typeof recipeData.image[0] === 'string'
        ? recipeData.image[0]
        : recipeData.image[0]?.url;
    } else if (recipeData.image.url) {
      imageUrl = recipeData.image.url;
    }
  }

  // Extract steps
  let steps: string[] = [];
  if (recipeData.recipeInstructions) {
    if (Array.isArray(recipeData.recipeInstructions)) {
      steps = recipeData.recipeInstructions.map((step: any) => {
        if (typeof step === 'string') return step;
        if (step.text) return step.text;
        if (step['@type'] === 'HowToSection' && step.itemListElement) {
          return step.itemListElement.map((item: any) => item.text || item).join(' ');
        }
        return '';
      }).filter(Boolean);
    } else if (typeof recipeData.recipeInstructions === 'string') {
      steps = recipeData.recipeInstructions.split(/\n+/).filter(Boolean);
    }
  }

  // Extract bake temp from text if present
  let bakeTemp: number | undefined;
  const allText = steps.join(' ') + ' ' + (recipeData.description || '');
  const tempMatch = allText.match(/(\d{3})\s*°?\s*F/i);
  if (tempMatch) {
    bakeTemp = parseInt(tempMatch[1]);
  }

  return normalizeRecipe({
    title: recipeData.name,
    description: recipeData.description,
    imageUrl,
    yield: recipeData.recipeYield,
    prepTime: recipeData.prepTime,
    cookTime: recipeData.cookTime || recipeData.totalTime,
    bakeTemp,
    ingredients: recipeData.recipeIngredient || [],
    steps,
  });
}
