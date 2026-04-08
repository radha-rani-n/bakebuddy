import { useState } from 'react';
import type { RecipeFormData } from '../../types/recipe';
import apiClient from '../../api/client';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import ManualEntry from './ManualEntry';
import toast from 'react-hot-toast';

interface ImageImportProps {
  onSave: (data: RecipeFormData) => Promise<void>;
}

export default function ImageImport({ onSave }: ImageImportProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<Partial<RecipeFormData> | null>(null);

  const handleImport = async () => {
    if (!imageUrl.trim()) return;
    setLoading(true);
    try {
      const { data } = await apiClient.post('/import/image', { imageUrl });
      setParsed({ ...data.parsed, importSource: 'IMAGE', imageUrl });
      toast.success('Recipe extracted from image! Review and save.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to extract recipe from image');
    } finally {
      setLoading(false);
    }
  };

  if (parsed) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">Review the extracted recipe and make any edits before saving.</p>
          <Button variant="ghost" size="sm" onClick={() => setParsed(null)}>Start Over</Button>
        </div>
        <ManualEntry onSave={onSave} initialData={parsed} />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 mb-2">Import from Image</h3>
      <p className="text-sm text-gray-500 mb-4">
        Provide an image URL of a recipe (e.g., a photo of a recipe card or cookbook page).
        We'll use AI to extract the recipe text.
      </p>
      <p className="text-xs text-gray-400 mb-4">
        Tip: Upload your image to Cloudinary or any image host first, then paste the URL here.
      </p>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="https://res.cloudinary.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
        <Button onClick={handleImport} loading={loading} disabled={!imageUrl.trim()}>
          Extract
        </Button>
      </div>
    </Card>
  );
}
