import { useState, useEffect } from 'react';
import { useKonamiCode } from '../components/Konami';

export const useAppState = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useKonamiCode(() => {
    setIsFlipped(!isFlipped);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  });

  return {
    isFlipped,
    showConfetti,
  };
};