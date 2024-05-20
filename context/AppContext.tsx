import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AppState {
  isFlipped: boolean;
  showConfetti: boolean;
  setIsFlipped: (value: boolean) => void;
  setShowConfetti: (value: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  return (
    <AppContext.Provider value={{ isFlipped, showConfetti, setIsFlipped, setShowConfetti }}>
      {children}
    </AppContext.Provider>
  );
};