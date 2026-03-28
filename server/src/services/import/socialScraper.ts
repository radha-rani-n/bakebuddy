import { extractRecipeWithGemini } from './geminiExtractor';
import type { ParsedRecipe } from './recipeParser';

export async function scrapeSocial(
  url: string,
  platform: 'tiktok' | 'instagram'
): Promise<ParsedRecipe> {
  // Attempt to fetch the page and extract any available text
  let pageText = '';
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BakeBuddy/1.0)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });

    if (response.ok) {
      const html = await response.text();

      // Extract meta tags and any visible text
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)
        || html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);

      if (titleMatch) pageText += `Title: ${titleMatch[1]}\n`;
      if (descMatch) pageText += `Description: ${descMatch[1]}\n`;

      // Try to find any JSON-LD data
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
      if (jsonLdMatch) {
        for (const match of jsonLdMatch) {
          const content = match.replace(/<\/?script[^>]*>/gi, '');
          pageText += `Structured data: ${content}\n`;
        }
      }
    }
  } catch {
    // Social platforms often block scraping, continue with URL alone
  }

  if (!pageText.trim()) {
    pageText = `This is a ${platform} baking recipe post at URL: ${url}. Please extract any recipe information you can infer from the URL and platform context.`;
  }

  const combinedText = `${platform.toUpperCase()} baking recipe post.\nURL: ${url}\n\n${pageText}`;

  return extractRecipeWithGemini(combinedText, platform);
}
