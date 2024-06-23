import React, { useCallback, useEffect, useReducer, useRef } from 'react';
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

interface State {
  prompt: string;
  responses: string[];
  currentResponse: string;
  temperature: number;
  progress: number;
  character1: string;
  character2: string;
  isEngineLoaded: boolean;
  moderatorInstruction: string;
}

type Action =
  | { type: 'SET_PROMPT'; payload: string }
  | { type: 'APPEND_RESPONSE'; payload: string }
  | { type: 'SET_CURRENT_RESPONSE'; payload: string }
  | { type: 'SET_TEMPERATURE'; payload: number }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_CHARACTER1'; payload: string }
  | { type: 'SET_CHARACTER2'; payload: string }
  | { type: 'SET_ENGINE_LOADED'; payload: boolean }
  | { type: 'SET_MODERATOR_INSTRUCTION'; payload: string };

const initialState: State = {
  prompt: INITIAL_PROMPT,
  responses: [],
  currentResponse: '',
  temperature: 1.0,
  progress: 0,
  character1: DEFAULT_CHARACTER_1,
  character2: DEFAULT_CHARACTER_2,
  isEngineLoaded: false,
  moderatorInstruction: INITIAL_MODERATOR_INSTRUCTION,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PROMPT':
      return { ...state, prompt: action.payload };
    case 'APPEND_RESPONSE':
      return { ...state, responses: [...state.responses, action.payload] };
    case 'SET_CURRENT_RESPONSE':
      return { ...state, currentResponse: action.payload };
    case 'SET_TEMPERATURE':
      return { ...state, temperature: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'SET_CHARACTER1':
      return { ...state, character1: action.payload };
    case 'SET_CHARACTER2':
      return { ...state, character2: action.payload };
    case 'SET_ENGINE_LOADED':
      return { ...state, isEngineLoaded: action.payload };
    case 'SET_MODERATOR_INSTRUCTION':
      return { ...state, moderatorInstruction: action.payload };
    default:
      throw new Error('Unknown action type');
  }
}

const LLM: React.FC<LLMProps> = ({
  defaultCharacter1 = DEFAULT_CHARACTER_1,
  defaultCharacter2 = DEFAULT_CHARACTER_2,
}) => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    character1: defaultCharacter1,
    character2: defaultCharacter2,
  });

  const engineRef = useRef<MLCEngineInterface | null>(null);

  const messageDict: Record<string, ChatCompletionMessageParam[]> = {
    [AI_1]: [
      {
        role: 'system',
        content: `You are ${state.character1} and you are having a conversation with ${state.character2}. You MUST speak only as ${state.character1}.`,
      },
    ],
    [AI_2]: [
      {
        role: 'system',
        content: `You are ${state.character2} and you are having a conversation with ${state.character1}. You MUST speak only as ${state.character2}.`,
      },
    ],
    [AI_3]: [
      {
        role: 'system',
        content: state.moderatorInstruction,
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
      temperature: state.temperature,
      response_format: { type: json ? 'json_object' : 'text' },
    };

    const asyncChunkGenerator =
      await engineRef.current.chat.completions.create(request);
    let reply = '';

    for await (const chunk of asyncChunkGenerator) {
      if (chunk.choices[0].delta.content) {
        reply += chunk.choices[0].delta.content;
        dispatch({ type: 'SET_CURRENT_RESPONSE', payload: reply });
      }
    }

    dispatch({ type: 'APPEND_RESPONSE', payload: reply })
    return await engineRef.current.getMessage();
  };

  const handleStartConversation = async () => {
    if (!state.character1 || !state.character2) {
      return;
    }
    if (!engineRef.current) {
      console.error('Engine not initialized');
      return;
    }
    try {
      messageDict[AI_3].push({
        role: 'user',
        content: `They are roleplaying as ${state.character1} and ${state.character2}.
        (Note that ${state.character1} always speaks immediately after you)
        Here's the starting scenario: ${state.prompt}\n\n Moderator: `,
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
          content: `${state.character1}: "${messageFromAI1}"\n\n${state.character2}: "${messageFromAI2}\n\nModerator:"`,
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
    dispatch({ type: 'SET_CHARACTER1', payload: jsonMessage.character1 });
    dispatch({ type: 'SET_CHARACTER2', payload: jsonMessage.character2 });
    dispatch({ type: 'SET_PROMPT', payload: jsonMessage.scenario });
  };

  function updateProgressBar(text: string): void {
    const match = text.match(/(\d+)\/(\d+)/);
    if (match) {
      const loaded = parseInt(match[1], 10);
      const total = parseInt(match[2], 10);
      const percentage = (loaded / total) * 100;

      dispatch({ type: 'SET_PROGRESS', payload: percentage });
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
        dispatch({ type: 'SET_ENGINE_LOADED', payload: true });
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
      {!state.isEngineLoaded && (
        <Progress
          radius='xl'
          size='xl'
          value={state.progress}
          striped
          animated
        />
      )}
      <PromptInput
        prompt={state.prompt}
        setPrompt={(prompt) =>
          dispatch({ type: 'SET_PROMPT', payload: prompt })
        }
        onEnter={handleStartConversation}
      />
      <ModeratorInstructionInput
        instruction={state.moderatorInstruction}
        setInstruction={(instruction) =>
          dispatch({ type: 'SET_MODERATOR_INSTRUCTION', payload: instruction })
        }
      />
      <TemperatureSlider
        temperature={state.temperature}
        setTemperature={(temperature) =>
          dispatch({ type: 'SET_TEMPERATURE', payload: temperature })
        }
      />
      <CharacterInput
        character1={state.character1}
        setCharacter1={(character1) =>
          dispatch({ type: 'SET_CHARACTER1', payload: character1 })
        }
        character2={state.character2}
        setCharacter2={(character2) =>
          dispatch({ type: 'SET_CHARACTER2', payload: character2 })
        }
      />
      <ConversationControls
        isEngineLoaded={state.isEngineLoaded}
        character1={state.character1}
        character2={state.character2}
        onStartConversation={handleStartConversation}
        onStopConversation={handleStopConversation}
        onMakeCharacters={makeCharacters}
      />
      <ConversationDisplay
        currentResponse={state.currentResponse}
        responses={state.responses}
        getColorClass={getColorClass}
      />
    </div>
  );
};

export default LLM;
