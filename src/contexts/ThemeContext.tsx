import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { userSettingsService } from '../lib/database';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  unitsSystem: 'metric' | 'imperial';
  toggleUnits: () => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [unitsSystem, setUnitsSystem] = useState<'metric' | 'imperial'>('metric');
  const [loading, setLoading] = useState(true);

  // Load user settings on mount and when user changes
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const settings = await userSettingsService.get(user.id);
        if (settings) {
          setTheme(settings.theme);
          setUnitsSystem(settings.units_system);
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserSettings();
  }, [user]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    if (user) {
      try {
        await userSettingsService.upsert(user.id, { theme: newTheme });
      } catch (error) {
        console.error('Error updating theme:', error);
        // Revert on error
        setTheme(theme);
      }
    }
  };

  const toggleUnits = async () => {
    const newUnits = unitsSystem === 'metric' ? 'imperial' : 'metric';
    setUnitsSystem(newUnits);

    if (user) {
      try {
        await userSettingsService.upsert(user.id, { units_system: newUnits });
      } catch (error) {
        console.error('Error updating units:', error);
        // Revert on error
        setUnitsSystem(unitsSystem);
      }
    }
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    unitsSystem,
    toggleUnits,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};