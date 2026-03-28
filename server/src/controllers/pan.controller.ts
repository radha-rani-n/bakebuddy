import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { calculatePanVolume } from '../services/scaling/panCalculator';

const panSchema = z.object({
  name: z.string().min(1),
  shape: z.enum(['ROUND', 'SQUARE', 'RECTANGULAR', 'LOAF', 'MUFFIN_TIN']),
  diameter: z.number().positive().optional(),
  width: z.number().positive().optional(),
  length: z.number().positive().optional(),
  height: z.number().positive().default(2),
  cupCount: z.number().int().positive().optional(),
  cupVolume: z.number().positive().optional(),
});

export async function listPans(req: Request, res: Response) {
  const pans = await prisma.pan.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ pans });
}

export async function createPan(req: Request, res: Response) {
  try {
    const body = panSchema.parse(req.body);
    const volume = calculatePanVolume(body);

    const pan = await prisma.pan.create({
      data: {
        ...body,
        userId: req.userId!,
        volumeCubicInches: volume,
      },
    });

    res.status(201).json({ pan });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.issues });
      return;
    }
    throw err;
  }
}

export async function updatePan(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const body = panSchema.parse(req.body);
    const volume = calculatePanVolume(body);

    const existing = await prisma.pan.findFirst({ where: { id, userId: req.userId! } });
    if (!existing) {
      res.status(404).json({ error: 'Pan not found' });
      return;
    }

    const pan = await prisma.pan.update({
      where: { id },
      data: { ...body, volumeCubicInches: volume },
    });

    res.json({ pan });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.issues });
      return;
    }
    throw err;
  }
}

export async function deletePan(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.pan.findFirst({ where: { id, userId: req.userId! } });

  if (!existing) {
    res.status(404).json({ error: 'Pan not found' });
    return;
  }

  await prisma.pan.delete({ where: { id } });
  res.json({ message: 'Pan deleted' });
}
