import React from 'react';
import Confetti from 'react-confetti';
import { useAppState } from '../context/AppContext';

const HomePage: React.FC = () => {
  const { isFlipped, showConfetti } = useAppState();
  return (
    <div>
      {showConfetti && <Confetti />}
      <div className={`app-container ${isFlipped ? 'flipped' : ''}`}>
        <div>
          <h2>Home</h2>
          <p>Welcome to my personal website!</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
