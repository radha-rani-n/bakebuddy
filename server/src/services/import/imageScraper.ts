import { extractRecipeFromImage } from './geminiExtractor';
import type { ParsedRecipe } from './recipeParser';

export async function scrapeImage(imageUrl: string): Promise<ParsedRecipe> {
  return extractRecipeFromImage(imageUrl);
}
