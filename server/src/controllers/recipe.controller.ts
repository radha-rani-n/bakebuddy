import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { calculatePanVolume } from '../services/scaling/panCalculator';

const ingredientSchema = z.object({
  sortOrder: z.number().int(),
  quantity: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  name: z.string().min(1),
  category: z.enum(['DRY', 'WET', 'LEAVENING', 'FAT', 'SUGAR', 'EGG', 'SPICE', 'OTHER']).default('OTHER'),
  notes: z.string().nullable().optional(),
});

const stepSchema = z.object({
  sortOrder: z.number().int(),
  text: z.string().min(1),
  ingredientRefs: z.any().optional(),
});

const recipeSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  sourceUrl: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  importSource: z.enum(['URL', 'YOUTUBE', 'TIKTOK', 'INSTAGRAM', 'IMAGE', 'MANUAL']),
  originalYield: z.number().int().positive().nullable().optional(),
  prepTime: z.number().int().nullable().optional(),
  cookTime: z.number().int().nullable().optional(),
  bakeTemp: z.number().int().nullable().optional(),
  bakeTempUnit: z.string().default('F'),
  originalPanShape: z.enum(['ROUND', 'SQUARE', 'RECTANGULAR', 'LOAF', 'MUFFIN_TIN']).nullable().optional(),
  originalPanWidth: z.number().nullable().optional(),
  originalPanLength: z.number().nullable().optional(),
  originalPanDiameter: z.number().nullable().optional(),
  originalPanHeight: z.number().nullable().optional(),
  originalPanVolume: z.number().nullable().optional(),
  ingredients: z.array(ingredientSchema),
  steps: z.array(stepSchema),
});

export async function listRecipes(req: Request, res: Response) {
  const q = req.query.q as string | undefined;

  const recipes = await prisma.recipe.findMany({
    where: {
      userId: req.userId!,
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
    },
    include: { _count: { select: { ingredients: true, steps: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ recipes });
}

export async function getRecipe(req: Request, res: Response) {
  const id = req.params.id as string;

  const recipe = await prisma.recipe.findFirst({
    where: { id, userId: req.userId! },
    include: {
      ingredients: { orderBy: { sortOrder: 'asc' } },
      steps: { orderBy: { sortOrder: 'asc' } },
      scaledRecipes: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!recipe) {
    res.status(404).json({ error: 'Recipe not found' });
    return;
  }

  res.json({ recipe });
}

export async function createRecipe(req: Request, res: Response) {
  try {
    const body = recipeSchema.parse(req.body);
    const { ingredients, steps, ...recipeData } = body;

    // Auto-calculate pan volume if pan dimensions are provided
    if (recipeData.originalPanShape && !recipeData.originalPanVolume) {
      try {
        recipeData.originalPanVolume = calculatePanVolume({
          shape: recipeData.originalPanShape,
          diameter: recipeData.originalPanDiameter,
          width: recipeData.originalPanWidth,
          length: recipeData.originalPanLength,
          height: recipeData.originalPanHeight || 2,
        });
      } catch {
        // If calculation fails, leave volume null
      }
    }

    const recipe = await prisma.recipe.create({
      data: {
        ...recipeData,
        userId: req.userId!,
        ingredients: { create: ingredients },
        steps: { create: steps },
      },
      include: {
        ingredients: { orderBy: { sortOrder: 'asc' } },
        steps: { orderBy: { sortOrder: 'asc' } },
      },
    });

    res.status(201).json({ recipe });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.issues });
      return;
    }
    throw err;
  }
}

export async function updateRecipe(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const body = recipeSchema.parse(req.body);
    const { ingredients, steps, ...recipeData } = body;

    const existing = await prisma.recipe.findFirst({ where: { id, userId: req.userId! } });
    if (!existing) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }

    // Delete existing ingredients/steps and recreate
    await prisma.$transaction([
      prisma.ingredient.deleteMany({ where: { recipeId: id } }),
      prisma.step.deleteMany({ where: { recipeId: id } }),
      prisma.recipe.update({
        where: { id },
        data: {
          ...recipeData,
          ingredients: { create: ingredients },
          steps: { create: steps },
        },
      }),
    ]);

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: { orderBy: { sortOrder: 'asc' } },
        steps: { orderBy: { sortOrder: 'asc' } },
      },
    });

    res.json({ recipe });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.issues });
      return;
    }
    throw err;
  }
}

const panUpdateSchema = z.object({
  originalPanShape: z.enum(['ROUND', 'SQUARE', 'RECTANGULAR', 'LOAF', 'MUFFIN_TIN']).nullable(),
  originalPanWidth: z.number().nullable().optional(),
  originalPanLength: z.number().nullable().optional(),
  originalPanDiameter: z.number().nullable().optional(),
  originalPanHeight: z.number().nullable().optional(),
});

export async function updateRecipePan(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const body = panUpdateSchema.parse(req.body);

    const existing = await prisma.recipe.findFirst({ where: { id, userId: req.userId! } });
    if (!existing) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }

    let volume: number | null = null;
    if (body.originalPanShape) {
      try {
        volume = calculatePanVolume({
          shape: body.originalPanShape,
          diameter: body.originalPanDiameter,
          width: body.originalPanWidth,
          length: body.originalPanLength,
          height: body.originalPanHeight || 2,
        });
      } catch {
        // leave null
      }
    }

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        originalPanShape: body.originalPanShape,
        originalPanWidth: body.originalPanWidth || null,
        originalPanLength: body.originalPanLength || null,
        originalPanDiameter: body.originalPanDiameter || null,
        originalPanHeight: body.originalPanHeight || null,
        originalPanVolume: volume,
      },
      include: {
        ingredients: { orderBy: { sortOrder: 'asc' } },
        steps: { orderBy: { sortOrder: 'asc' } },
        scaledRecipes: { orderBy: { createdAt: 'desc' } },
      },
    });

    res.json({ recipe });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.issues });
      return;
    }
    throw err;
  }
}

export async function deleteRecipe(req: Request, res: Response) {
  const id = req.params.id as string;
  const existing = await prisma.recipe.findFirst({ where: { id, userId: req.userId! } });

  if (!existing) {
    res.status(404).json({ error: 'Recipe not found' });
    return;
  }

  await prisma.recipe.delete({ where: { id } });
  res.json({ message: 'Recipe deleted' });
}
