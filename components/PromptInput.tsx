import React from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  onEnter: (value: string) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onEnter }) => {
  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onEnter(prompt);
    }
  };

  return (
    <div>
      <h3>Prompt</h3>
      <input
        type='text'
        value={prompt}
        onChange={handlePromptChange}
        onKeyDown={handleKeyPress}
        style={{ width: '100%', padding: '10px', marginBottom: '20px', fontSize: '16px' }}
      />
    </div>
  );
};

export default PromptInput;
