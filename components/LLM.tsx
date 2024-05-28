import React, {useEffect, useRef, useState} from 'react';
import {
  ChatCompletionMessageParam,
  ChatCompletionRequest,
  CreateMLCEngine,
  InitProgressReport,
  MLCEngineInterface,
} from '@mlc-ai/web-llm';

const LLM: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [responseScully, setResponseScully] = useState<string>('');
  const [responseMulder, setResponseMulder] = useState<string>('');
  const [responseModerator, setResponseModerator] = useState<string>('');
  const [initLabel, setInitLabel] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(0.8);
  const engineRef = useRef<MLCEngineInterface | null>(null);

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
  };

  const handleTemperatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTemperature(parseFloat(event.target.value));
  };

  const AI_1 = 'Scully';
  const AI_2 = 'Mulder';
  const AI_3 = "Moderator";
  const messageDict: Record<string, ChatCompletionMessageParam[]> = {
    [AI_1]: [{ role: 'system', content: 'You are Dana Scully and you are having a conversation with Mulder.' }],
    [AI_2]: [{ role: 'system', content: 'You are Fox Mulder and you are having a conversation with Scully.' }],
    [AI_3]: [{ role: 'system', content: 'You are a moderator between two roleplayers that are engaging in a discussion. They are roleplaying as Fox Mulder and Dana Scully from The X-Files. After each one of them has spoken, you will have a turn to interject. Keep your responses short. Your goal is to move the story along and stop them from getting into a discussion loop. Be creative, introduce new events to the story!' }],
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
    try {
      if (!engineRef.current) {
        console.error('Engine not initialized');
        return;
      }

      messageDict[AI_1].push({ role: 'user', content: prompt });

      for (let i = 0; i < 3; i++) {
        // Scully talks
        const messageFromScully = await getOneMessage(messageDict[AI_1], setResponseScully);
        messageDict[AI_1].push({ role: 'assistant', content: messageFromScully });
        messageDict[AI_2].push({ role: 'user', content: messageFromScully });

        // Mulder talks
        const messageFromMulder = await getOneMessage(messageDict[AI_2], setResponseMulder);
        messageDict[AI_1].push({ role: 'user', content: messageFromMulder });
        messageDict[AI_2].push({ role: 'assistant', content: messageFromMulder });

        messageDict[AI_3].push({ role: 'user', content: `SCULLY: "${messageFromScully}"\n\n MULDER: "${messageFromMulder}"` });

        // Moderator talks
        const messageFromModerator = await getOneMessage(messageDict[AI_3], setResponseModerator);
        messageDict[AI_1].push({ role: 'user', content: messageFromModerator });
        messageDict[AI_2].push({ role: 'user', content: messageFromModerator });
        messageDict[AI_3].push({ role: 'assistant', content: messageFromModerator });
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
        const selectedModel = 'Llama-3-8B-Instruct-q4f16_1';
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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <p>Open console to see output</p>
      <label id='init-label'>{initLabel}</label>
      <h3>Prompt</h3>
      <input
        type='text'
        value={prompt}
        onChange={handlePromptChange}
        placeholder='Type your prompt here'
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          fontSize: '16px'
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
      <button
        onClick={handleButtonClick}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007BFF',
          color: '#FFF',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Generate Response
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
        <div style={{ flex: '1', marginRight: '10px' }}>
          <h3>Response from Scully</h3>
          <label id='response-scully'>{responseScully}</label>
        </div>
        <div style={{ flex: '1', marginRight: '10px' }}>
          <h3>Response from Mulder</h3>
          <label id='response-mulder'>{responseMulder}</label>
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