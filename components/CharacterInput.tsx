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
  <div className={styles.formRow}>
    <div>
      <label>
        Character 1:
        <input
          type='text'
          value={character1}
          onChange={(e) => setCharacter1(e.target.value)}
        />
      </label>
    </div>
    <div>
      <label>
        Character 2:
        <input
          type='text'
          value={character2}
          onChange={(e) => setCharacter2(e.target.value)}
        />
      </label>
    </div>
  </div>
);

export default CharacterInput;
