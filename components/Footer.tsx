import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className='footer'>
      <div className='container'>
        <p>
          <Link href='/'>© 2024 Andrew Epstein</Link>
        </p>
        <ul className='social-links'>
          <li>
            <a
              href='https://www.linkedin.com/in/andrew-epstein/'
              target='_blank'
              rel='noopener noreferrer'
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href='https://github.com/Eppie'
              target='_blank'
              rel='noopener noreferrer'
            >
              GitHub
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;