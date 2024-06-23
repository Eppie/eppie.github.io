import React from 'react';
import { Slider, Tooltip } from '@mantine/core';

interface TemperatureSliderProps {
  temperature: number;
  setTemperature: (value: number) => void;
}

const TEMPERATURE_MIN = 0;
const TEMPERATURE_MAX = 1.5;
const TEMPERATURE_STEP = 0.01;

const TEMPERATURE_MARKS = [
  { value: 0, label: '0' },
  { value: 0.5, label: '0.5' },
  { value: 1, label: '1' },
  { value: 1.5, label: '1.5' },
];

const TOOLTIP_TEXT = `How predictable or creative the AI's responses are. Lower values make the AI more focused and consistent, while higher values make the responses more diverse and imaginative.`;

const TemperatureSlider: React.FC<TemperatureSliderProps> = ({
  temperature,
  setTemperature,
}) => {
  return (
    <div>
      <hr aria-hidden='true' />
      <p>Temperature: {temperature.toFixed(2)}</p>
      <Tooltip label={TOOLTIP_TEXT} withArrow>
        <Slider
          value={temperature}
          onChange={setTemperature}
          min={TEMPERATURE_MIN}
          max={TEMPERATURE_MAX}
          step={TEMPERATURE_STEP}
          marks={TEMPERATURE_MARKS}
          styles={{ root: { marginBottom: '40px' } }}
          label={null}
          aria-label='Adjust AI response temperature'
        />
      </Tooltip>
    </div>
  );
};

export default React.memo(TemperatureSlider);
