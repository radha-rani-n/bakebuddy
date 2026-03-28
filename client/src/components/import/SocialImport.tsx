import { useState } from 'react';
import { RecipeFormData } from '../../types/recipe';
import apiClient from '../../api/client';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import ManualEntry from './ManualEntry';
import toast from 'react-hot-toast';

interface SocialImportProps {
  onSave: (data: RecipeFormData) => Promise<void>;
}

export default function SocialImport({ onSave }: SocialImportProps) {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<'tiktok' | 'instagram'>('tiktok');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<Partial<RecipeFormData> | null>(null);

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const { data } = await apiClient.post('/import/social', { url, platform });
      setParsed({
        ...data.parsed,
        importSource: platform === 'tiktok' ? 'TIKTOK' : 'INSTAGRAM',
        sourceUrl: url,
      });
      toast.success('Recipe extracted! Review and save.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to import from social media');
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
      <h3 className="font-semibold text-gray-900 mb-2">Import from Social Media</h3>
      <p className="text-sm text-gray-500 mb-4">
        Paste a TikTok or Instagram link. We'll use AI to extract the recipe.
      </p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPlatform('tiktok')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            platform === 'tiktok' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          TikTok
        </button>
        <button
          onClick={() => setPlatform('instagram')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            platform === 'instagram' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Instagram
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder={platform === 'tiktok' ? 'https://www.tiktok.com/@user/video/...' : 'https://www.instagram.com/reel/...'}
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
