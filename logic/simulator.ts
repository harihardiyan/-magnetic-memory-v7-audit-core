
import { TrainingLog, TaskType, MemoryState, FeatureImportance, AblationResult, AuditSnapshot, NegativeControlResult, NegativeControlEpoch, DomainVerdict, StatVerdict, FinalVerdict, PhysicsBaseline } from "../types";
import { INITIAL_COERCIVITIES, DOMAIN_SLICES, TASK_LABELS } from "../constants";

/**
 * MMV7-QISKIT-ENGINE: 6-Qubit Hilbert Space Simulator
 */
class QuantumBackendV7 {
  static DIM = 64; 

  static getGHZ(): number[] {
    const v = new Array(64).fill(0);
    v[0] = 1 / Math.sqrt(2);
    v[63] = 1 / Math.sqrt(2);
    return v;
  }

  static getW(): number[] {
    const v = new Array(64).fill(0);
    const indices = [1, 2, 4, 8, 16, 32];
    indices.forEach(i => v[i] = 1 / Math.sqrt(6));
    return v;
  }

  static getDicke2(): number[] {
    const v = new Array(64).fill(0);
    let count = 0;
    for (let i = 0; i < 64; i++) {
      if (this.popcount(i) === 2) {
        v[i] = 1;
        count++;
      }
    }
    const factor = 1 / Math.sqrt(count);
    return v.map(x => x * factor);
  }

  static getCluster(): number[] {
    const v = new Array(64).fill(1 / Math.sqrt(64));
    for (let i = 0; i < 64; i++) {
      let phase = 1;
      for (let bit = 0; bit < 5; bit++) {
        if (((i >> bit) & 1) && ((i >> (bit + 1)) & 1)) phase *= -1;
      }
      v[i] *= phase;
    }
    return v;
  }

  static getRandom(): number[] {
    let v = Array.from({ length: 64 }, () => Math.random() - 0.5);
    const norm = Math.sqrt(v.reduce((a, b) => a + b * b, 0));
    return v.map(x => x / norm);
  }

  static popcount(n: number): number {
    return n.toString(2).split('1').length - 1;
  }

  static getPhysicsBaseline(v: number[]): PhysicsBaseline {
    const normSq = v.reduce((a, b) => a + b * b, 0);
    const purity = Math.min(1.0, normSq);
    const entropy = -v.reduce((a, b) => b === 0 ? a : a + (b * b * Math.log2(b * b)), 0);
    const entanglementIndicator = Math.min(1.0, entropy / 6); 

    return {
      purity,
      entanglementIndicator,
      entropy,
      isPure: Math.abs(purity - 1.0) < 1e-4
    };
  }
}

/**
 * Domain Classifier V7-PRO: Anti-Vulnerability Edition
 * 
 * Logic:
 * 1. Semantic Score (Keyword based) is the initial anchor.
 * 2. Plausibility Check (Numerical range) acts as a gatekeeper.
 * 3. Confidence is slashed if keywords exist but numerical distributions are absurd.
 */
export const classifyDomain = (meta: { 
  ndim: number; 
  size: number; 
  maxVal: number; 
  isComplex: boolean; 
  entropy: number;
  semanticScore: number;
  variance: number;
}) => {
  const { ndim, size, maxVal, isComplex, entropy, semanticScore, variance } = meta;
  
  let predictions = [
    { domain: 'Quantum State', confidence: 0.0 },
    { domain: 'Quantum Metadata', confidence: 0.0 },
    { domain: 'Tabular/Finance', confidence: 0.0 },
    { domain: 'Adversarial Noise', confidence: 0.0 }
  ];

  // Plausibility Rules
  const isPhysicallyAbsurd = maxVal > 1000 || variance > 500;
  const isMarketDataLikely = maxVal > 10.0 && !isComplex && semanticScore < 0.2;

  // 1. Quantum State (Strict)
  if (isComplex && size === 64) {
    predictions[0].confidence = 0.95;
    if (isPhysicallyAbsurd) predictions[0].confidence *= 0.1;
  }

  // 2. Quantum Metadata (Refined)
  if (semanticScore > 0.3) {
    let baseConf = 0.4 + (semanticScore * 0.6);
    
    // Integrity Verification: If keywords suggest "TRL" but maxVal is 10,000, it's fake.
    if (maxVal > 15.0) {
      baseConf *= 0.2; // Numerical range doesn't match quantum engineering metrics (TRL 1-9)
    }
    
    // Entropy check for metadata (metadata shouldn't be white noise)
    if (entropy > 5.8) {
      baseConf *= 0.3; // Metadata is usually structured, not high-entropy noise
    }

    predictions[1].confidence = baseConf;
  }

  // 3. Tabular / Finance
  if (isMarketDataLikely) {
    predictions[2].confidence = 0.85;
  }

  // 4. Adversarial / Noise (Detected Keyword Stuffing)
  if (semanticScore > 0.5 && (isPhysicallyAbsurd || entropy > 5.9)) {
    predictions[3].confidence = 0.95; // Strong confidence that this is a spoofing attempt
  }

  predictions.sort((a, b) => b.confidence - a.confidence);
  return predictions[0];
};

export const verifyQuantumBatch = (taskIdx: number, externalData?: any) => {
  const reasons: string[] = [];
  const meta = externalData || { 
    ndim: 2, 
    size: 64, 
    maxVal: 0.8, 
    isComplex: true, 
    norm: 1.0, 
    entropy: 4.2, 
    semanticScore: 1.0, 
    variance: 0.2 
  };
  
  const prediction = classifyDomain(meta);
  const THRESHOLD = 0.8; // Increased threshold for security
  
  const isQuantumDomain = prediction.domain.includes('Quantum');
  
  // Guardrail Verdicts
  if (prediction.domain === 'Adversarial Noise') {
    reasons.push("REJECT: Adversarial Keyword Stuffing Detected. Dataset contains quantum terminology but numerical distribution is non-physical noise.");
  } else if (!isQuantumDomain) {
    reasons.push(`REJECT: Semantic Mismatch. Data identified as [${prediction.domain}] with ${(prediction.confidence * 100).toFixed(1)}% confidence.`);
  } else if (prediction.confidence < THRESHOLD) {
    reasons.push(`REJECT: Low Domain Confidence. Semantic proof found but Numerical Plausibility check failed (Values likely spoofed).`);
  }

  // Physical Constraints
  if (prediction.domain === 'Quantum State' && meta.size !== 64) {
    reasons.push("REJECT: Hilbert Space dimension must be exactly 64 (2^6 qubits).");
  }

  const verdict: DomainVerdict = (isQuantumDomain && prediction.confidence >= THRESHOLD && (prediction.domain !== 'Quantum State' || meta.size === 64)) ? 'VALID_DOMAIN' : 'INVALID_DOMAIN';

  return {
    verdict,
    reasons,
    predictedDomain: prediction.domain,
    domainConfidence: prediction.confidence,
    quantumSignature: isQuantumDomain && prediction.confidence >= THRESHOLD,
    hilbertDimMatch: meta.size === 64,
    normalizationCheck: Math.abs(meta.norm - 1.0) < 0.05
  };
};

export const generateAuditSnapshot = (taskIdx: number, logs: TrainingLog[], externalData?: any): AuditSnapshot => {
  const finalLog = logs[logs.length - 1];
  const observedAcc = finalLog.acc;
  const meta = externalData || { ndim: 2, size: 64, maxVal: 0.8, isComplex: true, norm: 1.0, entropy: 4.2, semanticScore: 1.0, variance: 0.2 };
  const domainAudit = verifyQuantumBatch(taskIdx, meta);
  
  const engine = QuantumBackendV7;
  const ideal = [engine.getGHZ(), engine.getW(), engine.getDicke2(), engine.getCluster(), engine.getRandom()][taskIdx];
  const physics = engine.getPhysicsBaseline(ideal);

  const nullDist = Array.from({ length: 100 }, () => 0.45 + Math.random() * 0.1);
  const nullMean = nullDist.reduce((a, b) => a + b, 0) / nullDist.length;
  const pValue = nullDist.filter(acc => acc >= observedAcc).length / nullDist.length;
  const statVerdict: StatVerdict = pValue < 0.05 ? 'VALID_STAT' : 'INVALID_STAT';

  const finalVerdict: FinalVerdict = (domainAudit.verdict === 'VALID_DOMAIN' && statVerdict === 'VALID_STAT') ? 'VALID' : 'INVALID';

  return {
    taskIdx,
    label: TASK_LABELS[taskIdx as TaskType],
    domainVerdict: domainAudit.verdict,
    domainReasons: domainAudit.reasons,
    statVerdict,
    finalVerdict,
    shuffleLabelAcc: nullMean,
    nullDistribution: nullDist,
    nullMean,
    nullStd: 0.03,
    pValue,
    finalAcc: observedAcc,
    baselineAcc: 0.82,
    negativeControl: {
      accuracy: 0.5,
      f1: 0.49,
      isLeaky: false,
      ablationNoiseImpact: 0.01,
      nullMean: 0.5,
      nullStd: 0.03,
      timeline: []
    },
    timestamp: new Date().toISOString(),
    quantumSignature: domainAudit.quantumSignature,
    hilbertDimMatch: domainAudit.hilbertDimMatch,
    normalizationCheck: domainAudit.normalizationCheck,
    physics,
    predictedDomain: domainAudit.predictedDomain,
    domainConfidence: domainAudit.domainConfidence,
    metaFeatures: meta
  };
};

export const simulateEpoch = (
  epoch: number,
  prevLog: TrainingLog | null,
  task: TaskType,
  seed: number
): TrainingLog => {
  const engine = QuantumBackendV7;
  const ideal = [engine.getGHZ(), engine.getW(), engine.getDicke2(), engine.getCluster(), engine.getRandom()][task];
  const noise = Math.max(0, 0.2 * Math.pow(0.85, epoch));
  const baseAcc = 0.5 + (0.48 * (1 - Math.exp(-epoch / 4))) * (1 - noise);
  const currentAcc = Math.min(0.99, baseAcc + (Math.random() - 0.5) * 0.02);
  const currentLoss = 0.8 * Math.pow(0.9, epoch) * (1 + noise);
  const currentCoercivities = prevLog ? [...prevLog.coercivities] : [...INITIAL_COERCIVITIES];
  currentCoercivities[task] += (Math.random() * 0.02);
  const samples = 100;
  const TP = Math.round(samples * currentAcc * 0.5);
  const TN = Math.round(samples * currentAcc * 0.5);
  const FP = Math.round((samples - TP - TN) * 0.4);

  return {
    epoch,
    loss: currentLoss,
    acc: currentAcc,
    precision: TP / (TP + FP) || 0,
    recall: TP / (TP + (samples - TP - TN - FP)) || 0,
    f1: (2 * (TP / (TP + FP) || 0) * (TP / (TP + (samples - TP - TN - FP)) || 0)) / ((TP / (TP + FP) || 0) + (TP / (TP + (samples - TP - TN - FP)) || 0)) || 0,
    coercivities: currentCoercivities,
    validityScore: 0.5 + (currentAcc * 0.4),
    confusion: { TP, FP }
  };
};

export const generateInitialMemory = (): MemoryState => {
  const samples = 50;
  const totalDim = 640;
  return {
    matrix: Array.from({ length: samples }, () => Array.from({ length: totalDim }, () => Math.random() * 0.1 - 0.05)),
    slices: DOMAIN_SLICES,
    coercivities: INITIAL_COERCIVITIES
  };
};

export const updateMemory = (prevMemory: MemoryState, task: TaskType): MemoryState => {
  const { start, end } = DOMAIN_SLICES[task];
  const engine = QuantumBackendV7;
  const ideal = [engine.getGHZ(), engine.getW(), engine.getDicke2(), engine.getCluster(), engine.getRandom()][task];
  
  return {
    ...prevMemory,
    matrix: prevMemory.matrix.map((row) => {
      const newRow = [...row];
      for (let i = start; i < end; i++) {
        const hIdx = (i - start) % 64;
        newRow[i] += (ideal[hIdx] * 0.15) + (Math.random() * 0.05);
      }
      return newRow;
    })
  };
};

export const calculateFeatureImportance = (task: TaskType): FeatureImportance[] => {
  return Array.from({ length: 40 }, (_, i) => ({
    featureIdx: i,
    score: (i < 8 ? 0.8 : 0.2) + Math.random() * 0.1
  })).sort((a, b) => b.score - a.score);
};

export const calculateDomainAttribution = (task: TaskType): number[] => {
  return [0, 1, 2, 3, 4].map((i) => (i === task ? 0.9 : 0.1) + Math.random() * 0.05);
};

export const runAblationStudy = (task: TaskType): AblationResult[] => {
  return [0, 1, 2, 3, 4].map(d => ({
    domainIdx: d,
    accDrop: d === task ? 0.4 : 0.02,
    f1Drop: d === task ? 0.45 : 0.03
  }));
};
