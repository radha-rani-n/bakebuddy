import { Request, Response } from 'express';
import { z } from 'zod';
import { scrapeUrl } from '../services/import/urlScraper';
import { scrapeYoutube } from '../services/import/youtubeScraper';
import { scrapeSocial } from '../services/import/socialScraper';
import { scrapeImage } from '../services/import/imageScraper';

const urlSchema = z.object({ url: z.string().url() });
const socialSchema = z.object({
  url: z.string().url(),
  platform: z.enum(['tiktok', 'instagram']),
});
const imageSchema = z.object({ imageUrl: z.string().url() });

export async function importFromUrl(req: Request, res: Response) {
  try {
    const { url } = urlSchema.parse(req.body);
    const parsed = await scrapeUrl(url);
    res.json({ parsed });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid URL' });
      return;
    }
    const message = err instanceof Error ? err.message : 'Failed to import from URL';
    res.status(400).json({ error: message });
  }
}

export async function importFromYoutube(req: Request, res: Response) {
  try {
    const { url } = urlSchema.parse(req.body);
    const parsed = await scrapeYoutube(url);
    res.json({ parsed });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid URL' });
      return;
    }
    const message = err instanceof Error ? err.message : 'Failed to import from YouTube';
    res.status(400).json({ error: message });
  }
}

export async function importFromSocial(req: Request, res: Response) {
  try {
    const { url, platform } = socialSchema.parse(req.body);
    const parsed = await scrapeSocial(url, platform);
    res.json({ parsed });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }
    const message = err instanceof Error ? err.message : 'Failed to import from social media';
    res.status(400).json({ error: message });
  }
}

export async function importFromImage(req: Request, res: Response) {
  try {
    const { imageUrl } = imageSchema.parse(req.body);
    const parsed = await scrapeImage(imageUrl);
    res.json({ parsed });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid image URL' });
      return;
    }
    const message = err instanceof Error ? err.message : 'Failed to extract recipe from image';
    res.status(400).json({ error: message });
  }
}
