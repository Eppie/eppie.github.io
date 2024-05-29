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
  const [responseAI1, setResponseAI1] = useState<string>('');
  const [responseAI2, setResponseAI2] = useState<string>('');
  const [responseModerator, setResponseModerator] = useState<string>('');
  const [initLabel, setInitLabel] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(0.8);
  const engineRef = useRef<MLCEngineInterface | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [character1, setCharacter1] = useState<string>(defaultCharacter1);
  const [character2, setCharacter2] = useState<string>(defaultCharacter2);

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
        content: `You are a moderator between two roleplayers that are engaging in a discussion. They are roleplaying as ${character1} and ${character2}. After each one of them has spoken, you will have a turn to interject. Keep your responses short. Your goal is to move the story along and stop them from getting into a discussion loop. Be creative, introduce new events to the story!`,
      },
    ],
  };

  const getOneMessage = async (
    messages: ChatCompletionMessageParam[],
    setResponse: React.Dispatch<React.SetStateAction<string>>
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
      }
      setResponse(reply);
    }

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

      messageDict[AI_1].push({ role: 'user', content: prompt });

      for (let i = 0; i < 3; i++) {
        // AI1 talks
        console.log('Getting message from AI1:');
        const messageFromAI1 = await getOneMessage(
          messageDict[AI_1],
          setResponseAI1
        );
        console.log('Message from AI1: ' + messageFromAI1);
        messageDict[AI_1].push({
          role: 'assistant',
          content: messageFromAI1,
        });
        messageDict[AI_2].push({ role: 'user', content: messageFromAI1 });

        // AI2 talks
        console.log('Getting message from AI2:');
        const messageFromAI2 = await getOneMessage(
          messageDict[AI_2],
          setResponseAI2
        );
        console.log('Message from AI2: ' + messageFromAI2);
        messageDict[AI_1].push({ role: 'user', content: messageFromAI2 });
        messageDict[AI_2].push({
          role: 'assistant',
          content: messageFromAI2,
        });

        messageDict[AI_3].push({
          role: 'user',
          content: `${character1}: "${messageFromAI1}"\n\n ${character2}: "${messageFromAI2}"`,
        });

        // Moderator talks
        console.log('Getting message from Moderator:');
        const messageFromModerator = await getOneMessage(
          messageDict[AI_3],
          setResponseModerator
        );
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

  useEffect(() => {
    const initEngine = async () => {
      const initProgressCallback = (report: InitProgressReport) => {
        setInitLabel(report.text);
      };

      try {
        const selectedModel = 'Llama-3-8B-Instruct-q4f32_1';
        engineRef.current = await CreateMLCEngine(selectedModel, {
          initProgressCallback,
        });
      } catch (error) {
        console.error('Failed to initialize engine:', error);
      }
    };

    initEngine();
  }, []);

  return (
    <div className={styles.div1}>
      <label id='init-label'>{initLabel}</label>
      <h3>Prompt</h3>
      <input
        type='text'
        value={prompt}
        onChange={handlePromptChange}
        onKeyDown={handleKeyPress}
        placeholder='Type your prompt here'
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          fontSize: '16px',
        }}
      />
      <div style={{ marginBottom: '20px' }}>
        <label>Temperature: {temperature}</label>
        <input
          type='range'
          min='0'
          max='1.5'
          step='0.01'
          value={temperature}
          onChange={handleTemperatureChange}
          style={{ width: '100%', marginTop: '10px' }}
        />
      </div>
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
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        disabled={!character1 || !character2}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: !character1 || !character2 ? '#A9A9A9' : '#007BFF',
          color: '#FFF',
          border: 'none',
          borderRadius: '5px',
          cursor: !character1 || !character2 ? 'not-allowed' : 'pointer',
          opacity: !character1 || !character2 ? 0.6 : 1,
        }}
      >
        Start Conversation
      </button>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '30px',
        }}
      >
        <div style={{ flex: '1', marginRight: '10px' }}>
          <h3>Response from {character1}</h3>
          <label id='response-ai1'>{responseAI1}</label>
        </div>
        <div style={{ flex: '1', marginRight: '10px' }}>
          <h3>Response from {character2}</h3>
          <label id='response-ai2'>{responseAI2}</label>
        </div>
        <div style={{ flex: '1' }}>
          <h3>Response from Moderator</h3>
          <label id='response-moderator'>{responseModerator}</label>
        </div>
      </div>
    </div>
  );
};

export default LLM;
