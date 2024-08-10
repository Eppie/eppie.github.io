import React, { useState, useEffect, useRef } from 'react';
import Keyboard from '../../components/Keyboard';
import { Layout } from './types';
import styles from '../../styles/KeyboardOptimizer.module.css';

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

  const [initialTemperature, setInitialTemperature] = useState<number>(100);
  const [coolingRate, setCoolingRate] = useState<number>(0.999);
  const [iterations, setIterations] = useState<number>(100000);
  const [numRestarts, setNumRestarts] = useState<number>(5);

  const [distanceWeight, setDistanceWeight] = useState<number>(1);
  const [handBalanceWeight, setHandBalanceWeight] = useState<number>(1);
  const [sameFingerWeight, setSameFingerWeight] = useState<number>(1);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('./optimizeWorker.ts', import.meta.url)
    );
    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, bestLayout, bestMetric, iterationsCompleted } = e.data;
      if (type === 'progress') {
        setBestMetricOverall(bestMetric);
        setIterationCount(iterationsCompleted);
        setOptimizedLayout(bestLayout);
      } else if (type === 'result') {
        setOptimizedLayout(bestLayout);
        setBestMetricOverall(bestMetric);
        setIterationCount(iterationsCompleted);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleChangeText = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setText(event.target.value);
  };

  const handleOptimize = (): void => {
    setIterationCount(0);
    workerRef.current?.postMessage({
      layout,
      text,
      initialTemperature,
      coolingRate,
      iterations,
      numRestarts,
      weights: {
        // Add this object with the weights
        distance: distanceWeight,
        handBalance: handBalanceWeight,
        sameFinger: sameFingerWeight,
      },
    });
  };

  const layoutToString = (layout: Layout): string => {
    const keys = Object.keys(layout).sort((a, b) => {
      const [rowA, colA] = layout[a];
      const [rowB, colB] = layout[b];
      return rowA !== rowB ? rowA - rowB : colA - colB;
    });
    return keys.map((key) => key.toUpperCase()).join('');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Optimize Keyboard Layout</h1>
      <textarea
        className={styles.textArea}
        value={text}
        onChange={handleChangeText}
        rows={5}
        placeholder='Enter text to optimize for...'
      />
      <div className={styles.settingsGrid}>
        <div className={styles.settingGroup}>
          <h3>Optimization Settings</h3>
          <div className={styles.inputGroup}>
            <label htmlFor='initialTemp'>Initial Temperature:</label>
            <input
              id='initialTemp'
              type='number'
              value={initialTemperature}
              onChange={(e) => setInitialTemperature(Number(e.target.value))}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor='coolingRate'>Cooling Rate:</label>
            <input
              id='coolingRate'
              type='number'
              step='0.0001'
              value={coolingRate}
              onChange={(e) => setCoolingRate(Number(e.target.value))}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor='iterations'>Iterations:</label>
            <input
              id='iterations'
              type='number'
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor='restarts'>Number of Restarts:</label>
            <input
              id='restarts'
              type='number'
              value={numRestarts}
              onChange={(e) => setNumRestarts(Number(e.target.value))}
            />
          </div>
        </div>
        <div className={styles.settingGroup}>
          <h3>Metric Weights</h3>
          <div className={styles.inputGroup}>
            <label htmlFor='distanceWeight'>Distance Traveled:</label>
            <input
              id='distanceWeight'
              type='number'
              step='0.1'
              value={distanceWeight}
              onChange={(e) => setDistanceWeight(Number(e.target.value))}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor='handBalanceWeight'>Hand Balance:</label>
            <input
              id='handBalanceWeight'
              type='number'
              step='0.1'
              value={handBalanceWeight}
              onChange={(e) => setHandBalanceWeight(Number(e.target.value))}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor='sameFingerWeight'>Same Finger Strokes:</label>
            <input
              id='sameFingerWeight'
              type='number'
              step='0.1'
              value={sameFingerWeight}
              onChange={(e) => setSameFingerWeight(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
      <button className={styles.button} onClick={handleOptimize}>
        Optimize Layout
      </button>
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
        <h2>Original Layout</h2>
        <Keyboard layout={layoutToString(layout)} />
      </div>
      <div className={styles.keyboardContainer}>
        <h2>Optimized Layout</h2>
        <Keyboard layout={layoutToString(optimizedLayout || layout)} />
      </div>
    </div>
  );
};

export default KeyboardPage;
