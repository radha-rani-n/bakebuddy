import { useState } from 'react';
import { usePans } from '../hooks/usePans';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import PanForm from '../components/pans/PanForm';
import type { Pan } from '../types/pan';
import toast from 'react-hot-toast';

const shapeLabels: Record<string, string> = {
  ROUND: 'Round',
  SQUARE: 'Square',
  RECTANGULAR: 'Rectangular',
  LOAF: 'Loaf',
  MUFFIN_TIN: 'Muffin Tin',
};

const shapeIcons: Record<string, string> = {
  ROUND: '⭕',
  SQUARE: '⬜',
  RECTANGULAR: '🟫',
  LOAF: '🍞',
  MUFFIN_TIN: '🧁',
};

export default function MyPans() {
  const { pans, loading, addPan, editPan, removePan } = usePans();
  const [showModal, setShowModal] = useState(false);
  const [editingPan, setEditingPan] = useState<Pan | null>(null);

  const handleDelete = async (pan: Pan) => {
    if (!window.confirm(`Delete "${pan.name}"?`)) return;
    try {
      await removePan(pan.id);
      toast.success('Pan deleted');
    } catch {
      toast.error('Failed to delete pan');
    }
  };

  const getDimensionText = (pan: Pan) => {
    switch (pan.shape) {
      case 'ROUND':
        return `${pan.diameter}" diameter × ${pan.height}" deep`;
      case 'SQUARE':
        return `${pan.width}" × ${pan.width}" × ${pan.height}" deep`;
      case 'RECTANGULAR':
      case 'LOAF':
        return `${pan.width}" × ${pan.length}" × ${pan.height}" deep`;
      case 'MUFFIN_TIN':
        return `${pan.cupCount} cups`;
      default:
        return '';
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">🍳 My Pans</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {pans.length} pan{pans.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>
        <Button onClick={() => { setEditingPan(null); setShowModal(true); }}>
          + Add Pan
        </Button>
      </div>

      {pans.length === 0 ? (
        <Card className="p-10 text-center animate-scale-in">
          <div className="text-5xl mb-4">🍳</div>
          <h3 className="font-semibold text-gray-900 mb-2">No pans yet</h3>
          <p className="text-sm text-gray-500 mb-6">
            Add your baking pans to enable smart pan-based recipe scaling!
          </p>
          <Button size="lg" onClick={() => setShowModal(true)}>Add Your First Pan</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pans.map((pan, i) => (
            <Card key={pan.id} className={`p-4 hover:-translate-y-1 group animate-fade-in-up delay-${Math.min((i + 1) * 100, 700)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:animate-float">{shapeIcons[pan.shape]}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{pan.name}</h3>
                    <p className="text-sm text-gray-500">{shapeLabels[pan.shape]}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p>{getDimensionText(pan)}</p>
                <p className="text-amber-700 font-medium mt-1">
                  {pan.volumeCubicInches.toFixed(1)} cubic inches
                </p>
              </div>
              <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEditingPan(pan); setShowModal(true); }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(pan)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingPan(null); }}
        title={editingPan ? 'Edit Pan' : 'Add Pan'}
      >
        <PanForm
          pan={editingPan}
          onSubmit={async (data) => {
            try {
              if (editingPan) {
                await editPan(editingPan.id, data);
                toast.success('Pan updated');
              } else {
                await addPan(data);
                toast.success('Pan added');
              }
              setShowModal(false);
              setEditingPan(null);
            } catch {
              toast.error('Failed to save pan');
            }
          }}
          onCancel={() => { setShowModal(false); setEditingPan(null); }}
        />
      </Modal>
    </div>
  );
}
