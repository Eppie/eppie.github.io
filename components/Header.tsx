import React from 'react';
import Link from 'next/link';
import styles from '../styles/Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <Link href='/'>Andrew Epstein</Link>
        </h1>
        <nav className={styles.nav}>
          <ul className={styles['nav-list']}>
            <li className={styles['nav-item']}>
              <Link href='/about'>About</Link>
            </li>
            <li className={styles['nav-item']}>
              <Link href='/projects'>Projects</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
