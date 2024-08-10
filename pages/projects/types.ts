export type Layout = {
    [key: string]: [number, number];
};

export type Metrics = {
    totalStrokes: number;
    fingerAlternations: number;
    sameFingerStrokes: number;
    leftHandStrokes: number;
    rightHandStrokes: number;
    distanceTraveled: number;
};

export interface OptimizationWeights {
    distance: number;
    handBalance: number;
    sameFinger: number;
}