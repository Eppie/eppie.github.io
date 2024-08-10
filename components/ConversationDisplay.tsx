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
}) => {
  const getColorClass = (index: number) => {
    switch (index % 3) {
      case 0:
        return `${styles.color1} ${styles.messageBubble}`;
      case 1:
        return `${styles.color2} ${styles.messageBubble}`;
      case 2:
        return `${styles.color3} ${styles.messageBubble}`;
      default:
        return '';
    }
  };
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
