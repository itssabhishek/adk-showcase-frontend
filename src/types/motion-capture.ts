import { NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface IFaceBlendshapeCategory {
  index: number;
  score: number;
  categoryName: string;
  displayName: string;
}

export interface IUnifiedFaceBlendshape {
  // Static properties
  categories: IFaceBlendshapeCategory[];
  headIndex: number;
  headName: string;

  // Dynamic properties (index signature)
  [key: string]: unknown;
}

export interface IBoneRotate {
  head: number[];
  neck: number[];
  spine: number[];
}

export interface IBodyPosition {
  position: NormalizedLandmark;
}

export interface IEmbeddingResult {
  faceLandmarks: NormalizedLandmark[][];
  faceBlendshapes: IUnifiedFaceBlendshape[];
  facialTransformationMatrixes: number[][];
  boneRotates: IBoneRotate[];
  bodyPositions: IBodyPosition[];
  time: number;
}

export interface IRecordConfig {
  maxDuration: number;
  framePerSecond: number;
}
