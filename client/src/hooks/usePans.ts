import { useState, useEffect, useCallback } from 'react';
import type { Pan, PanFormData } from '../types/pan';
import * as pansApi from '../api/pans';

export function usePans() {
  const [pans, setPans] = useState<Pan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPans = useCallback(async () => {
    try {
      setLoading(true);
      const { pans } = await pansApi.listPans();
      setPans(pans);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch pans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPans();
  }, [fetchPans]);

  const addPan = async (data: PanFormData) => {
    const { pan } = await pansApi.createPan(data);
    setPans((prev) => [pan, ...prev]);
    return pan;
  };

  const editPan = async (id: string, data: PanFormData) => {
    const { pan } = await pansApi.updatePan(id, data);
    setPans((prev) => prev.map((p) => (p.id === id ? pan : p)));
    return pan;
  };

  const removePan = async (id: string) => {
    await pansApi.deletePan(id);
    setPans((prev) => prev.filter((p) => p.id !== id));
  };

  return { pans, loading, error, addPan, editPan, removePan, refetch: fetchPans };
}
