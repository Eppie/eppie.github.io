import React, { useState, useEffect, useRef } from 'react';
import {
  NumberInput,
  Textarea,
  Button,
  Grid,
  Title,
  Container,
} from '@mantine/core';
import Keyboard from '../../components/Keyboard';
import { Layout } from '../../types/types';
import styles from '../../styles/KeyboardOptimizer.module.css';
import FingerSelector from '../../components/FingerSelector';

declare var Module: {
  _optimize_keyboard_layout: (
    text: string,
    initialTemperature: number,
    coolingRate: number,
    iterations: number,
    numRestarts: number,
    distanceWeight: number,
    handBalanceWeight: number,
    sameFingerWeight: number,
    layoutData: string,
    fingerAssignmentsData: string
  ) => any;  // Adjust the return type accordingly
  onRuntimeInitialized: () => void;
};

const KeyboardPage: React.FC = () => {
  const qwertyLayout: Layout = {
    Q: [0, 1],
    W: [0, 2],
    E: [0, 3],
    R: [0, 4],
    T: [0, 5],
    Y: [0, 6],
    U: [0, 7],
    I: [0, 8],
    O: [0, 9],
    P: [0, 10],
    A: [1, 1],
    S: [1, 2],
    D: [1, 3],
    F: [1, 4],
    G: [1, 5],
    H: [1, 6],
    J: [1, 7],
    K: [1, 8],
    L: [1, 9],
    Z: [2, 1],
    X: [2, 2],
    C: [2, 3],
    V: [2, 4],
    B: [2, 5],
    N: [2, 6],
    M: [2, 7],
  };

  const [layout] = useState<Layout>(qwertyLayout);
  const [text, setText] = useState<string>(
    'The quick brown fox jumps over the lazy dog.'
  );
  const [optimizedLayout, setOptimizedLayout] = useState<Layout | null>(layout);
  const [bestMetricOverall, setBestMetricOverall] = useState<number>(Infinity);
  const [iterationCount, setIterationCount] = useState<number>(0);
  const workerRef = useRef<Worker>();

  const [initialTemperature, setInitialTemperature] = useState<number>(1000);
  const [coolingRate, setCoolingRate] = useState<number>(0.99);
  const [iterations, setIterations] = useState<number>(1000000);
  const [numRestarts, setNumRestarts] = useState<number>(10);

  const [distanceWeight, setDistanceWeight] = useState<number>(1);
  const [handBalanceWeight, setHandBalanceWeight] = useState<number>(1);
  const [sameFingerWeight, setSameFingerWeight] = useState<number>(1);

  const [fingerAssignments, setFingerAssignments] = useState<{
    [key: string]: string;
  }>({});

  const [highlightedKeys, setHighlightedKeys] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    // Load the Emscripten-generated JavaScript file
    const loadWasm = async () => {
      const script = document.createElement('script');
      script.src = new URL('optimize.js', window.location.origin).toString();
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        console.log('WASM Module initialized via Emscripten');

        // At this point, `Module` should be available globally
        Module.onRuntimeInitialized = () => {
          console.log('Emscripten WASM Module is ready to use');
          // You can call functions here or save the module to state
        };
      };

      script.onerror = () => {
        console.error('Failed to load the Emscripten JavaScript file');
      };
    };

    loadWasm();
  }, []);;;


  const handleChangeText = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    const newText = event.target.value;
    setText(newText);
    const lastChar = newText.slice(-1).toUpperCase();
    setHighlightedKeys(new Set([lastChar]));
    setTimeout(() => {
      console.log('Clearing highlighted keys');
      setHighlightedKeys(new Set());
    }, 200);
  };

  const handleFingerAssign = (key: string, finger: string) => {
    setFingerAssignments((prev) => {
      const newAssignments = { ...prev, [key]: finger };
      return newAssignments;
    });
  };
  const handleOptimize = async (): Promise<void> => {
    console.log('Starting optimization');

    // Load WASM module if not loaded in useEffect
    const response = await fetch('/optimize.wasm');
    const buffer = await response.arrayBuffer();
    const wasmModule = await WebAssembly.instantiate(buffer, {});

    console.log('WASM Module loaded:', wasmModule.instance);

    const {
      exports: { optimize_keyboard_layout },
    } = wasmModule.instance;

    // Convert layout and fingerAssignments to JSON strings
    const layoutData = JSON.stringify({ ...layout, ' ': [3, 5] });
    const fingerAssignmentsData = JSON.stringify({
      ...fingerAssignments,
      ' ': 'Right Thumb',
    });

    // Call the WASM optimization function
    const result = Module._optimize_keyboard_layout(
      text,
      initialTemperature,
      coolingRate,
      iterations,
      numRestarts,
      distanceWeight,
      handBalanceWeight,
      sameFingerWeight,
      layoutData,
      fingerAssignmentsData
    );

    // Process the result and update state
    // Assuming `optimize_keyboard_layout` returns the optimized layout and metrics
    setOptimizedLayout(result.bestLayout);
    setBestMetricOverall(result.bestMetric);
    setIterationCount(result.iterationsCompleted);

    console.log('Updated state after WASM optimization:', {
      optimizedLayout: result.bestLayout,
      bestMetricOverall: result.bestMetric,
      iterationCount: result.iterationsCompleted,
    });
  };


  const layoutToString = (layout: Layout): string => {
    const keys = Object.keys(layout)
      .filter((key) => key !== ' ')
      .sort((a, b) => {
        const [rowA, colA] = layout[a];
        const [rowB, colB] = layout[b];
        return rowA !== rowB ? rowA - rowB : colA - colB;
      });
    const result = keys.map((key) => key.toUpperCase()).join('');
    return result;
  };

  const ensureValidLayout = (layout: Layout | null): Layout => {
    if (!layout) {
      return qwertyLayout;
    }
    const validLayout = { ...layout };
    if (!validLayout[' ']) {
      validLayout[' '] = [3, 5];
    }
    return validLayout;
  };

  return (
    <Container className={styles.container}>
      <Title order={1} className={styles.title}>
        Optimize Keyboard Layout
      </Title>
      <FingerSelector
        layout={layout}
        fingerAssignments={fingerAssignments}
        onFingerAssign={handleFingerAssign}
      />
      <Textarea
        value={text}
        onChange={handleChangeText}
        placeholder='Enter text to optimize for...'
        autosize
        minRows={5}
      />
      <Grid>
        <Grid.Col span={6}>
          <Title order={3}>Optimization Settings</Title>
          <NumberInput
            label='Initial Temperature'
            value={initialTemperature}
            onChange={(value) => {
              setInitialTemperature(Number(value));
            }}
          />
          <NumberInput
            label='Cooling Rate'
            value={coolingRate}
            onChange={(value) => {
              setCoolingRate(Number(value));
            }}
            step={0.0001}
          />
          <NumberInput
            label='Iterations'
            value={iterations}
            onChange={(value) => {
              setIterations(Number(value));
            }}
          />
          <NumberInput
            label='Number of Restarts'
            value={numRestarts}
            onChange={(value) => {
              setNumRestarts(Number(value));
            }}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Title order={3}>Metric Weights</Title>
          <NumberInput
            label='Distance Traveled'
            value={distanceWeight}
            onChange={(value) => {
              setDistanceWeight(Number(value));
            }}
            step={0.1}
          />
          <NumberInput
            label='Hand Balance'
            value={handBalanceWeight}
            onChange={(value) => {
              setHandBalanceWeight(Number(value));
            }}
            step={0.1}
          />
          <NumberInput
            label='Same Finger Strokes'
            value={sameFingerWeight}
            onChange={(value) => {
              setSameFingerWeight(Number(value));
            }}
            step={0.1}
          />
        </Grid.Col>
      </Grid>
      <Button className={styles.button} onClick={handleOptimize}>
        Optimize Layout
      </Button>
      <div className={styles.results}>
        <h2>
          Current Best Score:{' '}
          {bestMetricOverall === Infinity
            ? 'N/A'
            : bestMetricOverall.toFixed(2)}
        </h2>
        <h2>Iterations Completed: {iterationCount.toLocaleString()}</h2>
      </div>
      <div className={styles.keyboardContainer}>
        <h2>Optimized Layout</h2>
        <Keyboard
          layout={layoutToString(ensureValidLayout(optimizedLayout || layout))}
          highlightedKeys={highlightedKeys}
        />
      </div>
    </Container>
  );
};

export default KeyboardPage;
