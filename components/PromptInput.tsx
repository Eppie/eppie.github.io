import React from 'react';
import styles from '../styles/LLM.module.css';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onEnter: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  setPrompt,
  onEnter,
}) => {
  const handlePromptChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPrompt(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onEnter();
    }
  };

  return (
    <div>
      <h3>Prompt</h3>
      <textarea
        value={prompt}
        onChange={handlePromptChange}
        onKeyDown={handleKeyDown}
        className={styles.promptInput}
        rows={3}
        placeholder='Enter your prompt here...'
      />
    </div>
  );
};

export default PromptInput;
