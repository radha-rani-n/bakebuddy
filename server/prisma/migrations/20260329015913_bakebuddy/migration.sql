-- CreateEnum
CREATE TYPE "PanShape" AS ENUM ('ROUND', 'SQUARE', 'RECTANGULAR', 'LOAF', 'MUFFIN_TIN');

-- CreateEnum
CREATE TYPE "ImportSource" AS ENUM ('URL', 'YOUTUBE', 'TIKTOK', 'INSTAGRAM', 'IMAGE', 'MANUAL');

-- CreateEnum
CREATE TYPE "IngredientCategory" AS ENUM ('DRY', 'WET', 'LEAVENING', 'FAT', 'SUGAR', 'EGG', 'SPICE', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shape" "PanShape" NOT NULL,
    "diameter" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "cupCount" INTEGER,
    "cupVolume" DOUBLE PRECISION,
    "volumeCubicInches" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceUrl" TEXT,
    "imageUrl" TEXT,
    "importSource" "ImportSource" NOT NULL,
    "originalYield" INTEGER,
    "prepTime" INTEGER,
    "cookTime" INTEGER,
    "bakeTemp" INTEGER,
    "bakeTempUnit" TEXT NOT NULL DEFAULT 'F',
    "originalPanShape" "PanShape",
    "originalPanWidth" DOUBLE PRECISION,
    "originalPanLength" DOUBLE PRECISION,
    "originalPanDiameter" DOUBLE PRECISION,
    "originalPanHeight" DOUBLE PRECISION,
    "originalPanVolume" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "name" TEXT NOT NULL,
    "category" "IngredientCategory" NOT NULL DEFAULT 'OTHER',
    "notes" TEXT,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Step" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "ingredientRefs" JSONB,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScaledRecipe" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "scaleFactor" DOUBLE PRECISION NOT NULL,
    "scaleMethod" TEXT NOT NULL,
    "targetYield" INTEGER,
    "targetPanName" TEXT,
    "targetPanVolume" DOUBLE PRECISION,
    "adjustedBakeTemp" INTEGER,
    "adjustedBakeTime" INTEGER,
    "scaledIngredients" JSONB NOT NULL,
    "scaledSteps" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScaledRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Pan_userId_idx" ON "Pan"("userId");

-- CreateIndex
CREATE INDEX "Recipe_userId_idx" ON "Recipe"("userId");

-- CreateIndex
CREATE INDEX "Ingredient_recipeId_idx" ON "Ingredient"("recipeId");

-- CreateIndex
CREATE INDEX "Step_recipeId_idx" ON "Step"("recipeId");

-- CreateIndex
CREATE INDEX "ScaledRecipe_recipeId_idx" ON "ScaledRecipe"("recipeId");

-- AddForeignKey
ALTER TABLE "Pan" ADD CONSTRAINT "Pan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScaledRecipe" ADD CONSTRAINT "ScaledRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
