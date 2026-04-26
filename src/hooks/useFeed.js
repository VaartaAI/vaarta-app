import { useState, useEffect, useCallback } from 'react';
import { getFeed } from '../services/api';

export function useFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const fetchFeed = useCallback(async (category) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFeed(category);
      setItems(data);
    } catch (err) {
      setError(err.message || 'Failed to load feed');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(activeCategory);
  }, [activeCategory, fetchFeed]);

  const setCategory = useCallback((category) => {
    setActiveCategory(category);
  }, []);

  const refresh = useCallback(() => {
    fetchFeed(activeCategory);
  }, [activeCategory, fetchFeed]);

  return { items, loading, error, activeCategory, setCategory, refresh };
}
