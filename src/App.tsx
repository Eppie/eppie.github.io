import React, {useEffect, useState} from 'react';
import Footer from './components/Footer';
import './styles.css';
import TextToBinary from './components/TextToBinary';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import About from './components/About';
import Home from './components/Home';
import Header from './components/Header';

const useKonamiCode = (callback: () => void) => {
    const [input, setInput] = useState<string[]>([]);

    useEffect(() => {
        const konamiCode = [
            "ArrowUp", "ArrowUp",
            "ArrowDown", "ArrowDown",
            "ArrowLeft", "ArrowRight",
            "ArrowLeft", "ArrowRight",
            "KeyB", "KeyA"
        ];

        const handleKeyDown = (event: KeyboardEvent) => {
            setInput((prevInput) => [...prevInput, event.code].slice(-konamiCode.length));

            if (input.join('') === konamiCode.join('')) {
                callback();
                setInput([]); // Reset input after code is detected
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [input, callback]);

    return null;
};
const App: React.FC = () => {
    const [isFlipped, setIsFlipped] = useState(false);

    useKonamiCode(() => {
        setIsFlipped(!isFlipped);
    });

  return (
      <Router>
          <div className={`app-container ${isFlipped ? 'flipped' : ''}`}>
              <Header/>
              <Routes>
                  <Route path='/' element={<Home/>}/>
                  <Route path='/about' element={<About/>}/>
                  <Route path='/projects' element={<TextToBinary/>}/>
              </Routes>
              <Footer/>
          </div>
      </Router>
);
};

export default App;
