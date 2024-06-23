import React from 'react';
import styles from '../styles/LLM.module.css';

interface CharacterInputProps {
  character1: string;
  setCharacter1: (value: string) => void;
  character2: string;
  setCharacter2: (value: string) => void;
}

const CharacterInput: React.FC<CharacterInputProps> = ({
  character1,
  setCharacter1,
  character2,
  setCharacter2,
}) => {
  const handleCharacter1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharacter1(e.target.value);
  };

  const handleCharacter2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharacter2(e.target.value);
  };

  return (
    <div className={styles.characterInputContainer}>
      <CharacterInputField
        id='character1'
        label='Character 1'
        value={character1}
        onChange={handleCharacter1Change}
        colorClass={styles.color2}
      />
      <CharacterInputField
        id='character2'
        label='Character 2'
        value={character2}
        onChange={handleCharacter2Change}
        colorClass={styles.color3}
      />
    </div>
  );
};

interface CharacterInputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  colorClass: string;
}

const CharacterInputField: React.FC<CharacterInputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  colorClass,
}) => (
  <div className={styles.characterInputWrapper}>
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      type='text'
      value={value}
      onChange={onChange}
      className={`${styles.characterInput} ${colorClass}`}
      placeholder={`Enter ${label.toLowerCase()} name`}
    />
  </div>
);

export default React.memo(CharacterInput);
