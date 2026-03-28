import { useState } from 'react';
import { RecipeFormData } from '../../types/recipe';
import apiClient from '../../api/client';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import ManualEntry from './ManualEntry';
import toast from 'react-hot-toast';

interface YoutubeImportProps {
  onSave: (data: RecipeFormData) => Promise<void>;
}

export default function YoutubeImport({ onSave }: YoutubeImportProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<Partial<RecipeFormData> | null>(null);

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const { data } = await apiClient.post('/import/youtube', { url });
      setParsed({ ...data.parsed, importSource: 'YOUTUBE', sourceUrl: url });
      toast.success('Recipe extracted from YouTube! Review and save.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to import from YouTube');
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
      <h3 className="font-semibold text-gray-900 mb-2">Import from YouTube</h3>
      <p className="text-sm text-gray-500 mb-4">
        Paste a YouTube video link. We'll extract the recipe from the description and captions.
      </p>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
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
