import { google } from 'googleapis';
import { env } from '../../config/env';
import { normalizeRecipe } from './recipeParser';
import { scrapeUrl } from './urlScraper';
import type { ParsedRecipe } from './recipeParser';

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function parseDescriptionForRecipe(title: string, description: string) {
  const lines = description.split('\n').map(l => l.trim()).filter(Boolean);

  const ingredients: string[] = [];
  const steps: string[] = [];
  let section: 'none' | 'ingredients' | 'steps' = 'none';

  // Common section headers
  const ingredientHeaders = /^(ingredients|what you.?ll need|you.?ll need|recipe|supplies|for the)/i;
  const stepHeaders = /^(instructions|directions|steps|method|how to|procedure)/i;

  for (const line of lines) {
    // Detect section changes
    if (ingredientHeaders.test(line.replace(/[:\-—]/g, '').trim())) {
      section = 'ingredients';
      continue;
    }
    if (stepHeaders.test(line.replace(/[:\-—]/g, '').trim())) {
      section = 'steps';
      continue;
    }

    // Skip links, timestamps, social media, hashtags
    if (/^https?:\/\/|^@|^#|^\d{1,2}:\d{2}|follow me|subscribe|instagram|tiktok|facebook|twitter|discount|code:|coupon|affiliate/i.test(line)) {
      continue;
    }

    if (section === 'ingredients') {
      // Lines that look like ingredients: start with number, dash, bullet, or •
      if (/^[\d½¼¾⅓⅔⅛]|^[-•●▪◦–]|^[a-z]/i.test(line)) {
        const cleaned = line.replace(/^[-•●▪◦–]\s*/, '').trim();
        if (cleaned.length > 2 && cleaned.length < 150) {
          ingredients.push(cleaned);
        }
      }
    } else if (section === 'steps') {
      const cleaned = line.replace(/^\d+[.):\-]\s*/, '').trim();
      if (cleaned.length > 5) {
        steps.push(cleaned);
      }
    } else {
      // Auto-detect ingredients if no section header found
      // Lines starting with measurements are likely ingredients
      if (/^\d+\s*(cup|tbsp|tsp|tablespoon|teaspoon|oz|ounce|pound|lb|gram|g |kg |ml |stick|pinch)/i.test(line)) {
        ingredients.push(line);
        section = 'ingredients';
      }
    }
  }

  // If no structured ingredients found, try bullet-point lines
  if (ingredients.length === 0) {
    for (const line of lines) {
      if (/^[-•●▪◦–]\s*.+/.test(line)) {
        const cleaned = line.replace(/^[-•●▪◦–]\s*/, '').trim();
        if (cleaned.length > 2 && cleaned.length < 150) {
          ingredients.push(cleaned);
        }
      }
    }
  }

  // Extract bake temp from all text
  let bakeTemp: number | undefined;
  const allText = description + ' ' + title;
  const tempMatch = allText.match(/(\d{3})\s*°?\s*F/i);
  if (tempMatch) {
    bakeTemp = parseInt(tempMatch[1]);
  }

  // Extract cook time
  let cookTime: number | undefined;
  const timeMatch = allText.match(/(?:bake|cook)\s*(?:for\s*)?(\d+)\s*(?:-\s*\d+\s*)?min/i);
  if (timeMatch) {
    cookTime = parseInt(timeMatch[1]);
  }

  // Extract yield
  let recipeYield: number | undefined;
  const yieldMatch = allText.match(/(?:makes?|yields?|serves?)\s*:?\s*(\d+)/i);
  if (yieldMatch) {
    recipeYield = parseInt(yieldMatch[1]);
  }

  return { ingredients, steps, bakeTemp, cookTime, yield: recipeYield };
}

export async function scrapeYoutube(url: string): Promise<ParsedRecipe> {
  if (!env.YOUTUBE_API_KEY) {
    throw new Error('YouTube API key is not configured');
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Could not extract video ID from URL');
  }

  const youtube = google.youtube({ version: 'v3', auth: env.YOUTUBE_API_KEY });

  const videoResponse = await youtube.videos.list({
    part: ['snippet'],
    id: [videoId],
  });

  const video = videoResponse.data.items?.[0];
  if (!video) {
    throw new Error('Video not found');
  }

  const title = video.snippet?.title || '';
  const description = video.snippet?.description || '';
  const thumbnail =
    video.snippet?.thumbnails?.high?.url ||
    video.snippet?.thumbnails?.default?.url ||
    '';

  const extracted = parseDescriptionForRecipe(title, description);

  // If no ingredients found, try to find a recipe URL in the description and scrape it
  if (extracted.ingredients.length === 0) {
    // Extract all URLs from description
    const allUrls = description.match(/https?:\/\/[^\s]+/g) || [];
    // Filter out social media, YouTube, Amazon, etc.
    const skipDomains = /youtube|youtu\.be|instagram|tiktok|facebook|twitter|amazon|pinterest|vm\.tiktok|barnesandnoble|indiebound|chapters\.indigo|target\.com/i;
    const recipeUrls = allUrls.filter(u => !skipDomains.test(u));

    for (const recipeUrl of recipeUrls) {
      try {
        const scraped = await scrapeUrl(recipeUrl);
        if (scraped.ingredients.length > 0) {
          if (!scraped.imageUrl && thumbnail) {
            scraped.imageUrl = thumbnail;
          }
          return scraped;
        }
      } catch {
        // This URL didn't work, try next
      }
    }

    throw new Error(
      'Could not find recipe ingredients in the video description. Try using the URL or Manual import instead.'
    );
  }

  return normalizeRecipe({
    title: title.replace(/\s*[|\-–]\s*.*$/, '').trim() || 'Untitled Recipe',
    description: description.split('\n')[0]?.trim() || undefined,
    imageUrl: thumbnail,
    yield: extracted.yield,
    cookTime: extracted.cookTime,
    bakeTemp: extracted.bakeTemp,
    ingredients: extracted.ingredients,
    steps: extracted.steps.length > 0 ? extracted.steps : ['Follow the video for step-by-step instructions.'],
    bodyText: description,
  });
}
