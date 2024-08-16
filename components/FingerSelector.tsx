import React, { useEffect } from 'react';
import { Select, Grid } from '@mantine/core';

interface FingerSelectorProps {
  layout: { [key: string]: [number, number] };
  fingerAssignments: { [key: string]: string };
  onFingerAssign: (key: string, finger: string) => void;
}

const FingerSelector: React.FC<FingerSelectorProps> = ({
  layout,
  fingerAssignments,
  onFingerAssign,
}) => {
  const fingers = [
    'Left Pinky',
    'Left Ring',
    'Left Middle',
    'Left Index',
    'Left Thumb',
    'Right Thumb',
    'Right Index',
    'Right Middle',
    'Right Ring',
    'Right Pinky',
  ];

  const defaultFingerAssignments: { [key: string]: string } = {
    Q: 'Left Pinky',
    A: 'Left Pinky',
    Z: 'Left Pinky',
    W: 'Left Ring',
    S: 'Left Ring',
    X: 'Left Ring',
    E: 'Left Middle',
    D: 'Left Middle',
    C: 'Left Middle',
    R: 'Left Index',
    F: 'Left Index',
    V: 'Left Index',
    T: 'Left Index',
    G: 'Left Index',
    B: 'Left Index',
    Y: 'Right Index',
    H: 'Right Index',
    N: 'Right Index',
    U: 'Right Index',
    J: 'Right Index',
    M: 'Right Index',
    I: 'Right Middle',
    K: 'Right Middle',
    ',': 'Right Middle',
    O: 'Right Ring',
    L: 'Right Ring',
    '.': 'Right Ring',
    P: 'Right Pinky',
    ';': 'Right Pinky',
    '/': 'Right Pinky',
    ' ': 'Right Thumb',
  };

  useEffect(() => {
    // Set default finger assignments if not already set
    Object.entries(layout).forEach(([key]) => {
      if (!fingerAssignments[key] && defaultFingerAssignments[key]) {
        onFingerAssign(key, defaultFingerAssignments[key]);
      }
    });
  }, [layout, fingerAssignments, onFingerAssign]);

  return (
    <Grid>
      {Object.entries(layout).map(([key, [row, col]]) => (
        <Grid.Col span={2} key={key}>
          <Select
            label={`${key} (${row}, ${col})`}
            data={fingers.map((finger) => ({ value: finger, label: finger }))}
            value={
              fingerAssignments[key] || defaultFingerAssignments[key] || ''
            }
            onChange={(value) => onFingerAssign(key, value || '')}
          />
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default FingerSelector;
