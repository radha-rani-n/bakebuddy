import { google } from 'googleapis';
import { env } from '../../config/env';
import { extractRecipeWithGemini } from './geminiExtractor';
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

export async function scrapeYoutube(url: string): Promise<ParsedRecipe> {
  if (!env.YOUTUBE_API_KEY) {
    throw new Error('YouTube API key is not configured');
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Could not extract video ID from URL');
  }

  const youtube = google.youtube({ version: 'v3', auth: env.YOUTUBE_API_KEY });

  // Get video details
  const videoResponse = await youtube.videos.list({
    part: ['snippet', 'contentDetails'],
    id: [videoId],
  });

  const video = videoResponse.data.items?.[0];
  if (!video) {
    throw new Error('Video not found');
  }

  const title = video.snippet?.title || '';
  const description = video.snippet?.description || '';
  const thumbnail = video.snippet?.thumbnails?.high?.url ||
    video.snippet?.thumbnails?.default?.url || '';

  // Try to get captions
  let captionText = '';
  try {
    const captionsResponse = await youtube.captions.list({
      part: ['snippet'],
      videoId,
    });

    const captionTrack = captionsResponse.data.items?.find(
      (item) => item.snippet?.language === 'en'
    ) || captionsResponse.data.items?.[0];

    if (captionTrack?.id) {
      // Note: downloading captions requires OAuth, so we rely on description
      // In production, you'd use a caption download service
      captionText = ''; // Fallback to description only
    }
  } catch {
    // Captions not available, continue with description only
  }

  // Combine all text and send to Gemini for extraction
  const combinedText = `Video Title: ${title}\n\nVideo Description:\n${description}${
    captionText ? `\n\nCaptions:\n${captionText}` : ''
  }`;

  const parsed = await extractRecipeWithGemini(combinedText, 'youtube');

  // Add thumbnail as image
  if (!parsed.imageUrl && thumbnail) {
    parsed.imageUrl = thumbnail;
  }

  return parsed;
}
