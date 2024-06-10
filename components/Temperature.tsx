import React from 'react';

interface TemperatureSliderProps {
  temperature: number;
  setTemperature: React.Dispatch<React.SetStateAction<number>>;
}

const TemperatureSlider: React.FC<TemperatureSliderProps> = ({
  temperature,
  setTemperature,
}) => {
  const handleTemperatureChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTemperature(parseFloat(event.target.value));
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <p>
        The `temperature` slider controls how creative or predictable the AI’s
        responses are. Lower values (closer to 0) make the AI more focused and
        consistent, while higher values (closer to 1.5) make the responses more
        diverse and imaginative.
      </p>
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
  );
};

export default TemperatureSlider;
