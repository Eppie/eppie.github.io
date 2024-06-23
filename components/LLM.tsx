import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChatCompletionMessageParam,
  ChatCompletionRequest,
  CreateMLCEngine,
  InitProgressReport,
  MLCEngineInterface,
} from '@mlc-ai/web-llm';
import styles from '../styles/LLM.module.css';
import { Progress } from '@mantine/core';
import CharacterInput from './CharacterInput';
import TemperatureSlider from './Temperature';
import PromptInput from './PromptInput';
import ConversationDisplay from './ConversationDisplay';
import ModeratorInstructionInput from './ModeratorInstructionInput';
import ConversationControls from './ConversationControls';
import {
  DEFAULT_CHARACTER_1,
  DEFAULT_CHARACTER_2,
  INITIAL_PROMPT,
  INITIAL_MODERATOR_INSTRUCTION,
  AI_1,
  AI_2,
  AI_3,
  MODEL_NAME,
} from './constants';
interface LLMProps {
  defaultCharacter1?: string;
  defaultCharacter2?: string;
}

const LLM: React.FC<LLMProps> = ({
  defaultCharacter1 = DEFAULT_CHARACTER_1,
  defaultCharacter2 = DEFAULT_CHARACTER_2,
}) => {
  const [prompt, setPrompt] = useState<string>(INITIAL_PROMPT);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(1.0);
  const [progress, setProgress] = useState<number>(0);
  const engineRef = useRef<MLCEngineInterface | null>(null);
  const [character1, setCharacter1] = useState<string>(defaultCharacter1);
  const [character2, setCharacter2] = useState<string>(defaultCharacter2);
  const [isEngineLoaded, setIsEngineLoaded] = useState<boolean>(false);
  const [moderatorInstruction, setModeratorInstruction] = useState<string>(
    INITIAL_MODERATOR_INSTRUCTION
  );

  const appendResponse = (newResponse: string) => {
    setResponses((prevResponses) => [...prevResponses, newResponse]);
  };

  const messageDict: Record<string, ChatCompletionMessageParam[]> = {
    [AI_1]: [
      {
        role: 'system',
        content: `You are ${character1} and you are having a conversation with ${character2}. You MUST speak only as ${character1}.`,
      },
    ],
    [AI_2]: [
      {
        role: 'system',
        content: `You are ${character2} and you are having a conversation with ${character1}. You MUST speak only as ${character2}.`,
      },
    ],
    [AI_3]: [
      {
        role: 'system',
        content: moderatorInstruction,
      },
    ],
  };

  const getOneMessage = async (
    messages: ChatCompletionMessageParam[],
    json: boolean = false
  ): Promise<string> => {
    if (!engineRef.current) {
      console.error('Engine not initialized');
      return '';
    }

    const request: ChatCompletionRequest = {
      stream: true,
      messages: messages,
      temperature: temperature,
      response_format: { type: json ? 'json_object' : 'text' },
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

  const handleStartConversation = async () => {
    if (!character1 || !character2) {
      return;
    }
    if (!engineRef.current) {
      console.error('Engine not initialized');
      return;
    }
    try {
      messageDict[AI_3].push({
        role: 'user',
        content: `They are roleplaying as ${character1} and ${character2}.
        (Note that ${character1} always speaks immediately after you)
        Here's the starting scenario: ${prompt}\n\n Moderator: `,
      });

      for (let i = 0; i < 3; i++) {
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
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStopConversation = useCallback(async (): Promise<void> => {
    if (!engineRef.current) {
      console.error('Engine not initialized');
      return;
    }
    engineRef.current.interruptGenerate();
  }, []);

  const makeCharacters = async (): Promise<void> => {
    if (!engineRef.current) {
      console.error('Engine not initialized');
      return;
    }
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content:
          'Please list two people, either real or fictional, that you think could be interesting to put together into a roleplaying scenario. ' +
          'Additionally, please write a one sentence description of the scenario that you want to create. Your output MUST follow this json format:' +
          '{ "character1": "some_character", "character2": "some_other_character", "scenario": "some_description" },',
      },
    ];

    const userMessage = await getOneMessage(messages, true);
    const jsonMessage = JSON.parse(userMessage);
    console.log(userMessage);
    console.log(jsonMessage);
    setCharacter1(jsonMessage.character1 as string);
    setCharacter2(jsonMessage.character2 as string);
    setPrompt(jsonMessage.scenario as string);
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
    console.log('Text: ' + text);
  }

  useEffect(() => {
    const initEngine = async () => {
      const initProgressCallback = (report: InitProgressReport) => {
        updateProgressBar(report.text);
      };

      try {
        engineRef.current = await CreateMLCEngine(MODEL_NAME, {
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
      {!isEngineLoaded && (
        <Progress radius='xl' size='xl' value={progress} striped animated />
      )}
      <PromptInput
        prompt={prompt}
        setPrompt={setPrompt}
        onEnter={handleStartConversation}
      />
      <ModeratorInstructionInput
        instruction={moderatorInstruction}
        setInstruction={setModeratorInstruction}
      />
      <TemperatureSlider
        temperature={temperature}
        setTemperature={setTemperature}
      />
      <CharacterInput
        character1={character1}
        setCharacter1={setCharacter1}
        character2={character2}
        setCharacter2={setCharacter2}
      />
      <ConversationControls
        isEngineLoaded={isEngineLoaded}
        character1={character1}
        character2={character2}
        onStartConversation={handleStartConversation}
        onStopConversation={handleStopConversation}
        onMakeCharacters={makeCharacters}
      />
      <ConversationDisplay
        currentResponse={currentResponse}
        responses={responses}
        getColorClass={getColorClass}
      />
    </div>
  );
};

export default LLM;
