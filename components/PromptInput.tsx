import React from 'react';
import styles from '../styles/LLM.module.css';

interface PromptInputProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  onEnter: (value: string) => void;
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

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      onEnter(prompt);
    }
  };

  return (
    <div>
      <h3>Prompt</h3>
      <textarea
        value={prompt}
        onChange={handlePromptChange}
        onKeyDown={handleKeyPress}
        className={styles.promptInput}
        rows={3}
        placeholder='Enter your prompt here...'
      />
    </div>
  );
};

export default PromptInput;
