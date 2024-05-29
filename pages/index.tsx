import React from 'react';
import Home from '../components/Home';
import Confetti from 'react-confetti';
// import { useAppContext } from '../context/AppContext';
import { useAppState } from '../hooks/useAppState';
import LLM from '../components/LLM';

const HomePage: React.FC = () => {
  const { isFlipped, showConfetti } = useAppState();
  return (
    <div>
      {showConfetti && <Confetti />}

      <div className={`app-container ${isFlipped ? 'flipped' : ''}`}>
        <Home />
        <LLM />
      </div>
    </div>
  );
};

export default HomePage;
