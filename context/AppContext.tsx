import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useContext,
} from 'react';
import { useKonamiCode } from '../components/Konami';

interface AppState {
  isFlipped: boolean;
  showConfetti: boolean;
  setIsFlipped: (value: boolean) => void;
  setShowConfetti: (value: boolean) => void;
  theme: string;
  toggleTheme: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useKonamiCode(() => {
    setIsFlipped(!isFlipped);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  });

  return (
    <AppContext.Provider
      value={{
        isFlipped,
        showConfetti,
        setIsFlipped,
        setShowConfetti,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
