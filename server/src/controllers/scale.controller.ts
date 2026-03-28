import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { scaleRecipe } from '../services/scaling/scalingEngine';

const scaleSchema = z.object({
  method: z.enum(['servings', 'pan']),
  targetServings: z.number().int().positive().optional(),
  targetPanId: z.string().uuid().optional(),
});

export async function scale(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const body = scaleSchema.parse(req.body);

    const recipe = await prisma.recipe.findFirst({
      where: { id, userId: req.userId! },
      include: {
        ingredients: { orderBy: { sortOrder: 'asc' } },
        steps: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }

    let targetPan = null;
    if (body.method === 'pan' && body.targetPanId) {
      targetPan = await prisma.pan.findFirst({
        where: { id: body.targetPanId, userId: req.userId! },
      });
      if (!targetPan) {
        res.status(404).json({ error: 'Target pan not found' });
        return;
      }
    }

    const scaled = scaleRecipe(recipe, body.method, body.targetServings, targetPan);

    const savedScaled = await prisma.scaledRecipe.create({
      data: {
        recipeId: id,
        scaleFactor: scaled.scaleFactor,
        scaleMethod: body.method,
        targetYield: body.targetServings || null,
        targetPanName: targetPan?.name || null,
        targetPanVolume: targetPan?.volumeCubicInches || null,
        adjustedBakeTemp: scaled.adjustedBakeTemp,
        adjustedBakeTime: scaled.adjustedBakeTime,
        scaledIngredients: scaled.scaledIngredients,
        scaledSteps: scaled.scaledSteps,
      },
    });

    res.status(201).json({ scaledRecipe: savedScaled });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.issues });
      return;
    }
    throw err;
  }
}

export async function listScaled(req: Request, res: Response) {
  const { id } = req.params;

  const recipe = await prisma.recipe.findFirst({ where: { id, userId: req.userId! } });
  if (!recipe) {
    res.status(404).json({ error: 'Recipe not found' });
    return;
  }

  const scaled = await prisma.scaledRecipe.findMany({
    where: { recipeId: id },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ scaledRecipes: scaled });
}

export async function deleteScaled(req: Request, res: Response) {
  const { id, scaledId } = req.params;

  const recipe = await prisma.recipe.findFirst({ where: { id, userId: req.userId! } });
  if (!recipe) {
    res.status(404).json({ error: 'Recipe not found' });
    return;
  }

  const existing = await prisma.scaledRecipe.findFirst({ where: { id: scaledId, recipeId: id } });
  if (!existing) {
    res.status(404).json({ error: 'Scaled recipe not found' });
    return;
  }

  await prisma.scaledRecipe.delete({ where: { id: scaledId } });
  res.json({ message: 'Scaled recipe deleted' });
}
