import React from 'react';
import Home from '../components/Home';
import Confetti from 'react-confetti';
import { useAppState } from '../hooks/useAppState';

const HomePage: React.FC = () => {
  const { isFlipped, showConfetti } = useAppState();
  return (
    <div>
      {showConfetti && <Confetti />}
      <div className={`app-container ${isFlipped ? 'flipped' : ''}`}>
        <Home />
      </div>
    </div>
  );
};

export default HomePage;
