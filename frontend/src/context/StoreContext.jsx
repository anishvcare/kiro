import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/public');
      setSettings(res.data.settings);
    } catch (error) {
      console.error('Failed to fetch store settings');
    } finally {
      setLoading(false);
    }
  };

  const getSetting = (key, fallback = '') => {
    return settings[key] || fallback;
  };

  return (
    <StoreContext.Provider value={{ settings, getSetting, loading, refreshSettings: fetchSettings }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
