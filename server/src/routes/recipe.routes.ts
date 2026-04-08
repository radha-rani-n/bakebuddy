import { Router } from 'express';
import { listRecipes, getRecipe, createRecipe, updateRecipe, updateRecipePan, deleteRecipe } from '../controllers/recipe.controller';
import { scale, scalableIngredients, listScaled, deleteScaled } from '../controllers/scale.controller';

const router = Router();

router.get('/', listRecipes);
router.post('/', createRecipe);
router.get('/:id', getRecipe);
router.put('/:id', updateRecipe);
router.patch('/:id/pan', updateRecipePan);
router.delete('/:id', deleteRecipe);

// Scaling sub-routes
router.post('/:id/scale', scale);
router.get('/:id/scalable-ingredients', scalableIngredients);
router.get('/:id/scaled', listScaled);
router.delete('/:id/scaled/:scaledId', deleteScaled);

export default router;
