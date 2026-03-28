import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRecipe } from '../api/recipes';
import type { RecipeFormData } from '../types/recipe';
import ManualEntry from '../components/import/ManualEntry';
import UrlImport from '../components/import/UrlImport';
import YoutubeImport from '../components/import/YoutubeImport';
import SocialImport from '../components/import/SocialImport';
import ImageImport from '../components/import/ImageImport';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'manual', label: 'Manual' },
  { id: 'url', label: 'URL' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'social', label: 'Social' },
  { id: 'image', label: 'Image' },
];

export default function ImportRecipe() {
  const [activeTab, setActiveTab] = useState('manual');
  const navigate = useNavigate();

  const handleSave = async (data: RecipeFormData) => {
    try {
      const { recipe } = await createRecipe(data);
      toast.success('Recipe saved!');
      navigate(`/recipes/${recipe.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save recipe');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Import Recipe</h1>
        <p className="text-gray-600 mt-1">Add a recipe to your library</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'manual' && <ManualEntry onSave={handleSave} />}
      {activeTab === 'url' && <UrlImport onSave={handleSave} />}
      {activeTab === 'youtube' && <YoutubeImport onSave={handleSave} />}
      {activeTab === 'social' && <SocialImport onSave={handleSave} />}
      {activeTab === 'image' && <ImageImport onSave={handleSave} />}
    </div>
  );
}
