import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { scaleRecipe, getScalableIngredients } from '../services/scaling/scalingEngine';

const scaleSchema = z.object({
  method: z.enum(['servings', 'pan', 'ingredient']),
  targetServings: z.number().int().positive().optional(),
  targetPanId: z.string().uuid().optional(),
  ingredientName: z.string().optional(),
  haveQuantity: z.number().positive().optional(),
  haveUnit: z.string().optional(),
});

export async function scale(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
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

    if (body.method === 'pan' && !recipe.originalPanVolume) {
      res.status(400).json({ error: 'This recipe has no original pan size. Edit the recipe to add pan dimensions before scaling by pan.' });
      return;
    }

    const ingredientInput = body.method === 'ingredient' && body.ingredientName
      ? { ingredientName: body.ingredientName, haveQuantity: body.haveQuantity!, haveUnit: body.haveUnit || 'g' }
      : null;

    const scaled = scaleRecipe(recipe, body.method, body.targetServings, targetPan, ingredientInput);

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
        scaledIngredients: scaled.scaledIngredients as any,
        scaledSteps: scaled.scaledSteps as any,
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

export async function scalableIngredients(req: Request, res: Response) {
  const id = req.params.id as string;

  const recipe = await prisma.recipe.findFirst({
    where: { id, userId: req.userId! },
    include: { ingredients: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!recipe) {
    res.status(404).json({ error: 'Recipe not found' });
    return;
  }

  const scalable = getScalableIngredients(recipe.ingredients);
  res.json({
    ingredients: scalable.map(ing => ({
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      category: ing.category,
    })),
  });
}

export async function listScaled(req: Request, res: Response) {
  const id = req.params.id as string;

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
  const id = req.params.id as string;
  const scaledId = req.params.scaledId as string;

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
