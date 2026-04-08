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
  { id: 'manual', label: 'Manual', icon: '✏️' },
  { id: 'url', label: 'URL', icon: '🔗' },
  { id: 'youtube', label: 'YouTube', icon: '🎬' },
  { id: 'social', label: 'Social', icon: '📱' },
  { id: 'image', label: 'Image', icon: '📷' },
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
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">📥 Import Recipe</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Add a recipe to your library from any source</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl overflow-x-auto animate-fade-in-up delay-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-white text-amber-700 shadow-sm scale-[1.02]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in-up delay-200">
        {activeTab === 'manual' && <ManualEntry onSave={handleSave} />}
        {activeTab === 'url' && <UrlImport onSave={handleSave} />}
        {activeTab === 'youtube' && <YoutubeImport onSave={handleSave} />}
        {activeTab === 'social' && <SocialImport onSave={handleSave} />}
        {activeTab === 'image' && <ImageImport onSave={handleSave} />}
      </div>
    </div>
  );
}
