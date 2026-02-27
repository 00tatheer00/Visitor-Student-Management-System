import React, { createContext, useContext } from 'react';

/* Fixed defaults - no theme customization. All cards use same design. */
const defaultTheme = {
  instituteName: 'Institute of Health Sciences',
  instituteAddress: 'University of Peshawar',
  emergencyContact: 'Emergency: 112',
  enablePhotoOnCard: false,
  enableBackSidePrint: true,
  autoPrintOnCheckIn: true,
  playSoundOnPrint: true
};

const CardThemeContext = createContext(null);

export function CardThemeProvider({ children }) {
  return (
    <CardThemeContext.Provider value={{ theme: defaultTheme, loading: false, updateTheme: async () => {} }}>
      {children}
    </CardThemeContext.Provider>
  );
}

export function useCardTheme() {
  const ctx = useContext(CardThemeContext);
  return ctx || { theme: defaultTheme, loading: false, updateTheme: async () => {} };
}
