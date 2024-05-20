import React from 'react';
import Home from '../components/Home';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Confetti from 'react-confetti';
// import { useAppContext } from '../context/AppContext';
import { useAppState } from '../hooks/useAppState';

const HomePage: React.FC = () => {
  const { isFlipped, showConfetti } = useAppState();
  return (
    <div>
      {showConfetti && <Confetti />}
      <div className={`app-container ${isFlipped ? 'flipped' : ''}`}>
        <Header />
        <Home />
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
