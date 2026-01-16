import { useState, useEffect } from 'react';
import api from '../services/api';

export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const data = await api.getOpportunities();
      setOpportunities(data.opportunities || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { opportunities, loading, error, refetch: fetchOpportunities };
};
