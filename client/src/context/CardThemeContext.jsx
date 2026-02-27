import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config.js';

const defaultTheme = {
  primaryColor: '#7c3aed',
  secondaryColor: '#5b21b6',
  gradient: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
  textColor: '#1e293b',
  borderRadius: 16,
  fontFamily: 'Inter, sans-serif',
  logoUrl: '',
  templateStyle: 'modern-glass',
  autoPrintOnCheckIn: true,
  playSoundOnPrint: true,
  enablePhotoOnCard: false,
  enableBackSidePrint: true,
  instituteName: 'Institute of Health Sciences',
  instituteAddress: 'Address line here',
  emergencyContact: 'Emergency: 112'
};

const CardThemeContext = createContext(null);

export function CardThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/theme`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') setTheme({ ...defaultTheme, ...data });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateTheme = async (updates) => {
    try {
      const res = await fetch(`${API_BASE}/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok && data) setTheme((prev) => ({ ...prev, ...data }));
      return data;
    } catch (e) {
      throw e;
    }
  };

  return (
    <CardThemeContext.Provider value={{ theme, loading, updateTheme }}>
      {children}
    </CardThemeContext.Provider>
  );
}

export function useCardTheme() {
  const ctx = useContext(CardThemeContext);
  return ctx || { theme: defaultTheme, loading: false, updateTheme: async () => {} };
}
