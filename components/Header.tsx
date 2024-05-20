import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className='header'>
      <div className='container'>
        <h1 className='title'>
          <Link href='/'>Andrew Epstein</Link>
        </h1>
        <nav className='nav'>
          <ul className='nav-list'>
            <li className='nav-item'>
              <Link href='/about'>About</Link>
            </li>
            <li className='nav-item'>
              <Link href='/projects'>Projects</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
