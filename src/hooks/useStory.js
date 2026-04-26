import { useState, useEffect } from 'react';
import { getStory } from '../services/api';

export function useStory(clusterId) {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clusterId) return;
    let cancelled = false;

    async function fetchStory() {
      setLoading(true);
      setError(null);
      setStory(null);
      try {
        const data = await getStory(clusterId);
        if (!cancelled) setStory(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load story');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStory();
    return () => { cancelled = true; };
  }, [clusterId]);

  return { story, loading, error };
}
