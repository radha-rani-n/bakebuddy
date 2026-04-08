import { useState } from 'react';
import type { RecipeFormData } from '../../types/recipe';
import apiClient from '../../api/client';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import ManualEntry from './ManualEntry';
import toast from 'react-hot-toast';

interface UrlImportProps {
  onSave: (data: RecipeFormData) => Promise<void>;
}

export default function UrlImport({ onSave }: UrlImportProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<Partial<RecipeFormData> | null>(null);

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const { data } = await apiClient.post('/import/url', { url });
      setParsed({ ...data.parsed, importSource: 'URL', sourceUrl: url });
      toast.success('Recipe imported! Review and save.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to import from URL');
    } finally {
      setLoading(false);
    }
  };

  if (parsed) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">Review the imported recipe and make any edits before saving.</p>
          <Button variant="ghost" size="sm" onClick={() => setParsed(null)}>Start Over</Button>
        </div>
        <ManualEntry onSave={onSave} initialData={parsed} />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 mb-2">Import from Recipe URL</h3>
      <p className="text-sm text-gray-500 mb-4">
        Paste a link to a recipe website. We'll extract the recipe data automatically.
      </p>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="https://www.example.com/recipe/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <Button onClick={handleImport} loading={loading} disabled={!url.trim()}>
          Import
        </Button>
      </div>
    </Card>
  );
}
