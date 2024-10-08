const evaluateKeyboardLayout = (layout, text, fingerAssignments) => {
  const metrics = {
    totalStrokes: 0,
    fingerAlternations: 0,
    sameFingerStrokes: 0,
    leftHandStrokes: 0,
    rightHandStrokes: 0,
    distanceTraveled: 0,
  };

  let prevFinger = null;
  let prevPosition = null;

  for (let char of text.toUpperCase()) {
    if (char in layout) {
      const [row, col] = layout[char];
      metrics.totalStrokes += 1;

      const currentFinger =
        fingerAssignments[char] || (col < 5 ? 'left' : 'right');

      if (prevFinger !== null) {
        if (currentFinger !== prevFinger) {
          metrics.fingerAlternations += 1;
        } else {
          metrics.sameFingerStrokes += 1;
        }

        if (prevPosition !== null) {
          metrics.distanceTraveled +=
            Math.abs(row - prevPosition[0]) + Math.abs(col - prevPosition[1]);
        }
      }

      if (currentFinger.startsWith('Left')) {
        metrics.leftHandStrokes += 1;
      } else if (currentFinger.startsWith('Right')) {
        metrics.rightHandStrokes += 1;
      }

      prevFinger = currentFinger;
      prevPosition = [row, col];
    }
  }

  return metrics;
};

const tweakLayout = (layout) => {
  const keys = Object.keys(layout);
  const [key1, key2] = [
    keys[Math.floor(Math.random() * keys.length)],
    keys[Math.floor(Math.random() * keys.length)],
  ];
  const temp = layout[key1];
  layout[key1] = layout[key2];
  layout[key2] = temp;
  return layout;
};

const optimizeLayout = (
  layout,
  text,
  initialTemperature = 100,
  coolingRate = 0.999,
  iterations = 100000,
  numRestarts = 5,
  weights,
  fingerAssignments
) => {
  let bestLayoutOverall = null;
  let bestMetricOverall = Infinity;
  let iterationsCompleted = 0;

  for (let i = 0; i < numRestarts; i++) {
    let initialLayout = { ...layout };
    let bestLayout = initialLayout;
    let bestMetric = Infinity;
    let temperature = initialTemperature;
    let acceptanceCount = 0;

    for (let j = 0; j < iterations; j++) {
      let tweakedLayout = tweakLayout({ ...bestLayout });
      const metrics = evaluateKeyboardLayout(
        tweakedLayout,
        text,
        fingerAssignments
      );
      const overallMetric =
        weights.distance * metrics.distanceTraveled +
        weights.handBalance *
          Math.abs(metrics.leftHandStrokes - metrics.rightHandStrokes) +
        weights.sameFinger * metrics.sameFingerStrokes;

      if (overallMetric < bestMetric) {
        bestLayout = tweakedLayout;
        bestMetric = overallMetric;
        postMessage({
          type: 'progress',
          bestLayout,
          bestMetric,
          iterationsCompleted: j,
        });
      } else {
        const delta = overallMetric - bestMetric;
        const probability = Math.exp(-delta / temperature);
        if (Math.random() < probability) {
          bestLayout = tweakedLayout;
          acceptanceCount += 1;
        }
      }

      if (j % 1000 === 0) {
        temperature *= coolingRate;
        const acceptanceRate = acceptanceCount / 1000;
        acceptanceCount = 0;
        iterationsCompleted += 1000;
        console.log(
          `Iteration ${j}: Best metric = ${bestMetric}, Temperature = ${temperature}, Acceptance rate = ${acceptanceRate}`
        );
      }
    }

    if (bestMetric < bestMetricOverall) {
      bestLayoutOverall = bestLayout;
      bestMetricOverall = bestMetric;
    }
  }

  return {
    bestLayout: bestLayoutOverall,
    bestMetric: bestMetricOverall,
    iterationsCompleted,
  };
};

// Listen for messages from the main thread
onmessage = (e) => {
  const {
    layout,
    text,
    initialTemperature,
    coolingRate,
    iterations,
    numRestarts,
    weights,
    fingerAssignments,
  } = e.data;
  const result = optimizeLayout(
    layout,
    text,
    initialTemperature,
    coolingRate,
    iterations,
    numRestarts,
    weights,
    fingerAssignments
  );
  postMessage({
    type: 'result',
    bestLayout: result.bestLayout,
    bestMetric: result.bestMetric,
    iterationsCompleted: result.iterationsCompleted,
  });
};
