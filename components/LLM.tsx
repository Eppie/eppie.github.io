import React, { useEffect, useRef, useState } from 'react';
import {
  ChatCompletionMessageParam,
  ChatCompletionRequest,
  CreateMLCEngine,
  InitProgressReport,
  MLCEngineInterface,
} from '@mlc-ai/web-llm';
import styles from '../styles/LLM.module.css';
interface Props {
  defaultCharacter1?: string;
  defaultCharacter2?: string;
}

const LLM: React.FC<Props> = ({
  defaultCharacter1 = 'Dana Scully',
  defaultCharacter2 = 'Fox Mulder',
}) => {
  const [prompt, setPrompt] = useState<string>(
    'Scully, we have a new case. In the last 10 months, across 10 different states. 10 different people were killed. Each of them was exactly 10,000 days old at the time of their murder.'
  );
  const [responses, setResponses] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(0.8);
  const [progress, setProgress] = useState<number>(0);
  const engineRef = useRef<MLCEngineInterface | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [character1, setCharacter1] = useState<string>(defaultCharacter1);
  const [character2, setCharacter2] = useState<string>(defaultCharacter2);
  const [isEngineLoaded, setIsEngineLoaded] = useState<boolean>(false);

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
  };

  const handleTemperatureChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTemperature(parseFloat(event.target.value));
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      buttonRef.current?.click();
    }
  };

  const appendResponse = (newResponse: string) => {
    setResponses((prevResponses) => [...prevResponses, newResponse]);
  };

  const AI_1 = 'AI_1';
  const AI_2 = 'AI_2';
  const AI_3 = 'Moderator';
  const messageDict: Record<string, ChatCompletionMessageParam[]> = {
    [AI_1]: [
      {
        role: 'system',
        content: `You are ${character1} and you are having a conversation with ${character2}.`,
      },
    ],
    [AI_2]: [
      {
        role: 'system',
        content: `You are ${character2} and you are having a conversation with ${character1}.`,
      },
    ],
    [AI_3]: [
      {
        role: 'system',
        content: `You are a moderator between two roleplayers that are engaging in a discussion. They are roleplaying as ${character1} and ${character2}. After each one of them has spoken, you will have a turn to interject. Keep your responses short. Your goal is to move the story along. Be creative, introduce new events to the story!`,
      },
    ],
  };

  const getOneMessage = async (
    messages: ChatCompletionMessageParam[]
  ): Promise<string> => {
    if (!engineRef.current) {
      console.error('Engine not initialized');
      return '';
    }

    const request: ChatCompletionRequest = {
      stream: true,
      messages: messages,
      temperature: temperature,
    };

    const asyncChunkGenerator =
      await engineRef.current.chat.completions.create(request);
    let reply = '';

    for await (const chunk of asyncChunkGenerator) {
      if (chunk.choices[0].delta.content) {
        reply += chunk.choices[0].delta.content;
        setCurrentResponse(reply);
      }
    }

    appendResponse(reply);

    return await engineRef.current.getMessage();
  };

  const handleButtonClick = async () => {
    if (!character1 || !character2) {
      return;
    }
    try {
      if (!engineRef.current) {
        console.error('Engine not initialized');
        return;
      }

      messageDict[AI_1].push({
        role: 'user',
        content: `${character2}: ${prompt}`,
      });

      for (let i = 0; i < 3; i++) {
        // AI1 talks
        console.log('Getting message from AI1:');
        const messageFromAI1 = await getOneMessage(messageDict[AI_1]);
        console.log('Message from AI1: ' + messageFromAI1);
        messageDict[AI_1].push({
          role: 'assistant',
          content: messageFromAI1,
        });
        messageDict[AI_2].push({ role: 'user', content: messageFromAI1 });

        // AI2 talks
        console.log('Getting message from AI2:');
        const messageFromAI2 = await getOneMessage(messageDict[AI_2]);
        console.log('Message from AI2: ' + messageFromAI2);
        messageDict[AI_1].push({ role: 'user', content: messageFromAI2 });
        messageDict[AI_2].push({
          role: 'assistant',
          content: messageFromAI2,
        });

        messageDict[AI_3].push({
          role: 'user',
          content: `${character1}: "${messageFromAI1}"\n\n${character2}: "${messageFromAI2}\n\nModerator:"`,
        });

        // Moderator talks
        console.log('Getting message from Moderator:');
        const messageFromModerator = await getOneMessage(messageDict[AI_3]);
        console.log('Message from Moderator: ' + messageFromModerator);
        messageDict[AI_1].push({ role: 'user', content: messageFromModerator });
        messageDict[AI_2].push({ role: 'user', content: messageFromModerator });
        messageDict[AI_3].push({
          role: 'assistant',
          content: messageFromModerator,
        });
        console.log(messageDict);
      }
    } catch (error) {
      console.error(error);
    }
  };

  function updateProgressBar(text: string): void {
    const match = text.match(/(\d+)\/(\d+)/);
    if (match) {
      const loaded = parseInt(match[1], 10);
      const total = parseInt(match[2], 10);
      const percentage = (loaded / total) * 100;

      setProgress(percentage);
    } else {
      console.error('Text format is incorrect.');
    }
  }

  useEffect(() => {
    const initEngine = async () => {
      const initProgressCallback = (report: InitProgressReport) => {
        updateProgressBar(report.text);
      };

      try {
        const selectedModel = 'Llama-3-8B-Instruct-q4f32_1';
        engineRef.current = await CreateMLCEngine(selectedModel, {
          initProgressCallback,
        });
        setIsEngineLoaded(true);
      } catch (error) {
        console.error('Failed to initialize engine:', error);
      }
    };

    initEngine();
  }, []);

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
    <div className={styles.outer}>
      <progress
        id='progressBar'
        className={styles.progressBar}
        value={progress}
        max='100'
      ></progress>
      <h3>Prompt</h3>
      <input
        type='text'
        value={prompt}
        onChange={handlePromptChange}
        onKeyDown={handleKeyPress}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          fontSize: '16px',
        }}
      />
      <p>
        The `temperature` slider controls how creative or predictable the AI’s
        responses are. Lower values (closer to 0) make the AI more focused and
        consistent, while higher values (closer to 1.5) make the responses more
        diverse and imaginative.
      </p>
      <div style={{ marginBottom: '20px' }}>
        <label>Temperature: {temperature}</label>
        <input
          type='range'
          min='0'
          max='1.5'
          step='0.01'
          value={temperature}
          onChange={handleTemperatureChange}
          style={{ width: '50%', marginTop: '10px' }}
        />
      </div>
      <div className={styles.formRow}>
        <label>
          Character 1:
          <input
            type='text'
            value={character1}
            onChange={(e) => setCharacter1(e.target.value)}
          />
        </label>
        <label>
          Character 2:
          <input
            type='text'
            value={character2}
            onChange={(e) => setCharacter2(e.target.value)}
          />
        </label>
      </div>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        disabled={!isEngineLoaded || !character1 || !character2}
        className={`${styles.button} ${!isEngineLoaded || !character1 || !character2 ? styles.disabled : ''}`}
      >
        Start Conversation
      </button>
      <h3>Current response:</h3>
      <div>{currentResponse}</div>
      <div style={{ marginTop: '30px' }}>
        <h3>Conversation History</h3>
        <div id='conversation-history'>
          {responses.map((response, index) => (
            <div key={index} className={getColorClass(index)}>
              {response}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LLM;
