import React, { useEffect, useState } from 'react';
import styles from '../styles/Keyboard.module.css';

interface KeyboardProps {
  layout: string;
}

const Keyboard: React.FC<KeyboardProps> = ({ layout = 'qwertyuiopasdfghjklzxcvbnm' }) => {
  const [prevLayout, setPrevLayout] = useState<string>('');
  const [updatedKeys, setUpdatedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (layout.length === 26) {
      const newUpdatedKeys = new Set<string>();
      for (let i = 0; i < layout.length; i++) {
        if (layout[i] !== prevLayout[i]) {
          newUpdatedKeys.add(layout[i]);
        }
      }
      setUpdatedKeys(newUpdatedKeys);
      setPrevLayout(layout);

      const timeout = setTimeout(() => {
        setUpdatedKeys(new Set());
      }, 300); // Match the transition duration

      return () => clearTimeout(timeout);
    }
  }, [layout, prevLayout]);

  // Validate layout length
  if (layout.length !== 26) {
    return <div>Invalid layout string</div>;
  }

  const rows = [
    layout.slice(0, 10).split(''),
    layout.slice(10, 19).split(''),
    layout.slice(19).split(''),
  ];

  return (
    <div className={styles.keyboard}>
      <div className={styles.keyboardRow}>
        {rows[0].map((key, index) => (
          <div key={index} className={`${styles.key} ${updatedKeys.has(key) ? styles.updated : ''}`}>
            {key.toUpperCase()}
          </div>
        ))}
      </div>
      <div className={styles.keyboardRow}>
        <div className={`${styles.spacer} ${styles.half}`}></div>
        {rows[1].map((key, index) => (
          <div key={index} className={`${styles.key} ${updatedKeys.has(key) ? styles.updated : ''}`}>
            {key.toUpperCase()}
          </div>
        ))}
        <div className={`${styles.spacer} ${styles.half}`}></div>
      </div>
      <div className={styles.keyboardRow}>
        <div className={`${styles.spacer} ${styles.threeQuarters}`}></div>
        {rows[2].map((key, index) => (
          <div key={index} className={`${styles.key} ${updatedKeys.has(key) ? styles.updated : ''}`}>
            {key.toUpperCase()}
          </div>
        ))}
        <div className={`${styles.spacer} ${styles.rowThree}`}></div>
      </div>
    </div>
  );
};

export default Keyboard;