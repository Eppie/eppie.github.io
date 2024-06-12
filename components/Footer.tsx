import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Footer.module.css';
import { Switch } from '@mantine/core';
import { useAppState } from '../context/AppContext';

const Footer: React.FC = () => {
  const { toggleTheme, theme } = useAppState();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {isClient && (
          <Switch
            checked={theme === 'dark'}
            onChange={toggleTheme}
            label={
              theme === 'light'
                ? 'Switch to Dark Theme'
                : 'Switch to Light Theme'
            }
          />
        )}
        <p>
          <Link href='/'>© 2024 Andrew Epstein</Link>
        </p>
        <ul className={styles['social-links']}>
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
