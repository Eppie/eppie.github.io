import React from 'react';
import Footer from './components/Footer';
import './styles.css';
import TextToBinary from './components/TextToBinary';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import About from './components/About';
import Home from './components/Home';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/projects' element={<TextToBinary />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
