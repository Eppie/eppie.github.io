import React from 'react';
import styles from '../styles/LLM.module.css';

interface ConversationDisplayProps {
  currentResponse: string;
  responses: string[];
  getColorClass: (index: number) => string;
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({
  currentResponse,
  responses,
  getColorClass,
}) => {
  return (
    <div className={styles.conversationDisplay}>
      <h3>Current response:</h3>
      <div className={styles.currentResponse}>{currentResponse}</div>
      <div className={styles.conversationHistory}>
        <h3>Conversation History</h3>
        {responses.map((response, index) => (
          <div key={index} className={getColorClass(index)}>
            {response}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ConversationDisplay);
