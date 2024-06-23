import React from 'react';
import styles from '../styles/LLM.module.css';

interface ModeratorInstructionInputProps {
  instruction: string;
  setInstruction: (instruction: string) => void;
}

const ModeratorInstructionInput: React.FC<ModeratorInstructionInputProps> = ({
  instruction,
  setInstruction,
}) => {
  const handleInstructionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInstruction(event.target.value);
  };

  return (
    <div className={styles.moderatorInstructionContainer}>
      <h3>Moderator Instructions</h3>
      <textarea
        value={instruction}
        onChange={handleInstructionChange}
        className={styles.promptInput}
        rows={3}
        placeholder='Enter instructions for the moderator...'
      />
    </div>
  );
};

export default React.memo(ModeratorInstructionInput);
