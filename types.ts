
export enum TaskType {
  GHZ_VS_NON_GHZ = 0,
  W_VS_NON_W = 1,
  DICKE2_VS_NON_DICKE2 = 2,
  CLUSTER_VS_NON_CLUSTER = 3,
  RANDOM_VS_NON_RANDOM = 4
}

export interface TrainingLog {
  epoch: number;
  loss: number;
  acc: number;
  precision: number;
  recall: number;
  f1: number;
  coercivities: number[];
  validityScore: number; 
  confusion: {
    TP: number;
    FP: number;
  };
}

export interface DomainSlice {
  start: number;
  end: number;
}

export interface MemoryState {
  matrix: number[][]; // N x Dim
  slices: DomainSlice[];
  coercivities: number[];
}

export interface FeatureImportance {
  featureIdx: number;
  score: number;
}

export interface AblationResult {
  domainIdx: number;
  accDrop: number;
  f1Drop: number;
}

export interface NegativeControlEpoch {
  epoch: number;
  acc: number;
  verdict: 'VALID' | 'INVALID';
}

export interface NegativeControlResult {
  accuracy: number;
  f1: number;
  isLeaky: boolean;
  ablationNoiseImpact: number; 
  nullMean: number;
  nullStd: number;
  timeline: NegativeControlEpoch[];
}

export type DomainVerdict = 'VALID_DOMAIN' | 'INVALID_DOMAIN';
export type StatVerdict = 'VALID_STAT' | 'INVALID_STAT';
export type FinalVerdict = 'VALID' | 'INVALID';

export interface PhysicsBaseline {
  purity: number;
  entanglementIndicator: number;
  entropy: number;
  isPure: boolean;
}

export interface AuditSnapshot {
  taskIdx: number;
  label: string;
  domainVerdict: DomainVerdict;
  domainReasons: string[];
  statVerdict: StatVerdict;
  finalVerdict: FinalVerdict;
  shuffleLabelAcc: number;
  nullDistribution: number[];
  nullMean: number;
  nullStd: number;
  pValue: number;
  finalAcc: number;
  baselineAcc: number; 
  negativeControl: NegativeControlResult;
  timestamp: string;
  quantumSignature: boolean;
  hilbertDimMatch: boolean;
  normalizationCheck: boolean;
  physics: PhysicsBaseline;
  predictedDomain: string;
  domainConfidence: number;
  metaFeatures: {
    ndim: number;
    size: number;
    maxVal: number;
    isComplex: boolean;
  };
}

export interface AppState {
  isTraining: boolean;
  currentTask: TaskType;
  logs: TrainingLog[];
  memory: MemoryState;
  seed: number;
  datasetSize: number;
  featureImportance: FeatureImportance[];
  domainContributions: number[];
  ablationResults: AblationResult[];
  auditHistory: AuditSnapshot[];
  isAuditing: boolean;
  configSnapshot?: any;
}
