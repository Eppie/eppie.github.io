import React from 'react';
import styles from '../styles/LLM.module.css';

interface ConversationControlsProps {
  isEngineLoaded: boolean;
  character1: string;
  character2: string;
  onStartConversation: () => void;
  onStopConversation: () => void;
  onMakeCharacters: () => void;
}

const ConversationControls: React.FC<ConversationControlsProps> = ({
  isEngineLoaded,
  character1,
  character2,
  onStartConversation,
  onStopConversation,
  onMakeCharacters,
}) => {
  const isDisabled = !isEngineLoaded || !character1 || !character2;

  return (
    <div className={styles.conversationControls}>
      <button
        onClick={onStartConversation}
        disabled={isDisabled}
        className={`${styles.button} ${isDisabled ? styles.disabled : ''}`}
      >
        Start Conversation
      </button>
      <button
        onClick={onStopConversation}
        disabled={!isEngineLoaded}
        className={`${styles.button} ${!isEngineLoaded ? styles.disabled : ''}`}
      >
        Stop Conversation
      </button>
      <button
        onClick={onMakeCharacters}
        disabled={!isEngineLoaded}
        className={`${styles.button} ${!isEngineLoaded ? styles.disabled : ''}`}
      >
        Random Characters
      </button>
    </div>
  );
};

export default React.memo(ConversationControls);
