import React from 'react';
import styles from '../styles/LLM.module.css';

interface CharacterInputProps {
  character1: string;
  setCharacter1: React.Dispatch<React.SetStateAction<string>>;
  character2: string;
  setCharacter2: React.Dispatch<React.SetStateAction<string>>;
}

const CharacterInput: React.FC<CharacterInputProps> = ({
  character1,
  setCharacter1,
  character2,
  setCharacter2,
}) => (
  <div className={styles.characterInputContainer}>
    <div className={styles.characterInputWrapper}>
      <label htmlFor='character1'>Character 1:</label>
      <input
        id='character1'
        type='text'
        value={character1}
        onChange={(e) => setCharacter1(e.target.value)}
        className={`${styles.characterInput} ${styles.color1}`}
        placeholder='Enter first character name'
      />
    </div>
    <div className={styles.characterInputWrapper}>
      <label htmlFor='character2'>Character 2:</label>
      <input
        id='character2'
        type='text'
        value={character2}
        onChange={(e) => setCharacter2(e.target.value)}
        className={`${styles.characterInput} ${styles.color2}`}
        placeholder='Enter second character name'
      />
    </div>
  </div>
);

export default CharacterInput;
