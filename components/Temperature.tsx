import { Slider, Tooltip } from '@mantine/core';
import React from 'react';
import style from 'react-syntax-highlighter/dist/esm/styles/hljs/a11y-dark';

interface TemperatureSliderProps {
  temperature: number;
  setTemperature: React.Dispatch<React.SetStateAction<number>>;
}

const TemperatureSlider: React.FC<TemperatureSliderProps> = ({
  temperature,
  setTemperature,
}) => {
  return (
    <div style={{}}>
      <hr />
      <p></p>
      <p>Temperature: {temperature}</p>
      <Tooltip
        label="How predictable or creative the AI's responses are. Lower values make the AI more focused and consistent, while higher values
      make the responses more diverse and imaginative."
        withArrow
      >
        <Slider
          value={temperature}
          onChange={setTemperature}
          min={0}
          max={1.5}
          step={0.01}
          marks={[
            { value: 0, label: '0' },
            { value: 0.5, label: '0.5' },
            { value: 1, label: '1' },
            { value: 1.5, label: '1.5' },
          ]}
          styles={{ root: { marginBottom: '40px' } }}
          label={null}
        />
      </Tooltip>
    </div>
  );
};

export default TemperatureSlider;
