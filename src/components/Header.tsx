import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className='header'>
      <div className='container'>
        <h1 className='title'>
          <Link to='/'>Andrew Epstein</Link>
        </h1>
        <nav className='nav'>
          <ul className='nav-list'>
            <li className='nav-item'>
              <Link to='/about'>About</Link>
            </li>
            <li className='nav-item'>
              <Link to='/projects'>Projects</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
