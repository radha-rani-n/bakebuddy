import { Router } from 'express';
import { listRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe } from '../controllers/recipe.controller';
import { scale, listScaled, deleteScaled } from '../controllers/scale.controller';

const router = Router();

router.get('/', listRecipes);
router.post('/', createRecipe);
router.get('/:id', getRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

// Scaling sub-routes
router.post('/:id/scale', scale);
router.get('/:id/scaled', listScaled);
router.delete('/:id/scaled/:scaledId', deleteScaled);

export default router;
