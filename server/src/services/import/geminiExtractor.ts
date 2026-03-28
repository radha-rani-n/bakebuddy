import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { normalizeRecipe } from './recipeParser';
import type { ParsedRecipe } from './recipeParser';

function getGeminiClient() {
  if (!env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }
  return new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

const EXTRACTION_PROMPT = `Extract a baking recipe from the following content. Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "title": "string",
  "description": "string or null",
  "yield": "number (servings) or null",
  "prepTime": "number (minutes) or null",
  "cookTime": "number (minutes) or null",
  "bakeTemp": "number (fahrenheit) or null",
  "ingredients": [{"quantity": "string", "unit": "string or empty", "name": "string"}],
  "steps": ["step 1 text", "step 2 text"]
}

If any field cannot be determined, use null. For ingredients, include the full quantity as a string (e.g., "2 1/2").
`;

export async function extractRecipeWithGemini(
  text: string,
  source: string
): Promise<ParsedRecipe> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `${EXTRACTION_PROMPT}\n\nSource: ${source}\nContent:\n${text.slice(0, 15000)}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = response;
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonStr.trim());
  } catch {
    throw new Error('Failed to parse Gemini response as JSON');
  }

  // Convert Gemini's ingredient format to raw strings for the normalizer
  const ingredientStrings: string[] = (parsed.ingredients || []).map((ing: any) => {
    const parts = [];
    if (ing.quantity) parts.push(ing.quantity);
    if (ing.unit) parts.push(ing.unit);
    if (ing.name) parts.push(ing.name);
    return parts.join(' ');
  });

  return normalizeRecipe({
    title: parsed.title,
    description: parsed.description,
    yield: parsed.yield,
    prepTime: parsed.prepTime,
    cookTime: parsed.cookTime,
    bakeTemp: parsed.bakeTemp,
    ingredients: ingredientStrings,
    steps: parsed.steps || [],
  });
}

export async function extractRecipeFromImage(imageUrl: string): Promise<ParsedRecipe> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Fetch the image
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageResponse.status}`);
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const base64 = Buffer.from(imageBuffer).toString('base64');
  const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

  const prompt = `${EXTRACTION_PROMPT}\n\nThis is a photo of a baking recipe. Extract all visible recipe information.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64,
        mimeType,
      },
    },
  ]);

  const response = result.response.text();

  let jsonStr = response;
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonStr.trim());
  } catch {
    throw new Error('Failed to parse Gemini response as JSON');
  }

  const ingredientStrings: string[] = (parsed.ingredients || []).map((ing: any) => {
    const parts = [];
    if (ing.quantity) parts.push(ing.quantity);
    if (ing.unit) parts.push(ing.unit);
    if (ing.name) parts.push(ing.name);
    return parts.join(' ');
  });

  return normalizeRecipe({
    title: parsed.title,
    description: parsed.description,
    imageUrl,
    yield: parsed.yield,
    prepTime: parsed.prepTime,
    cookTime: parsed.cookTime,
    bakeTemp: parsed.bakeTemp,
    ingredients: ingredientStrings,
    steps: parsed.steps || [],
  });
}
