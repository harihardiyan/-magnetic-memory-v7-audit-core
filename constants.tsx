
import React from 'react';
import { TaskType, DomainSlice } from './types';

export const TASK_LABELS: Record<TaskType, string> = {
  [TaskType.GHZ_VS_NON_GHZ]: 'GHZ vs non-GHZ',
  [TaskType.W_VS_NON_W]: 'W vs non-W',
  [TaskType.DICKE2_VS_NON_DICKE2]: 'Dicke2 vs non-Dicke2',
  [TaskType.CLUSTER_VS_NON_CLUSTER]: 'Cluster vs non-Cluster',
  [TaskType.RANDOM_VS_NON_RANDOM]: 'Random vs non-Random',
};

export const TASK_DESCRIPTIONS: Record<TaskType, string> = {
  [TaskType.GHZ_VS_NON_GHZ]: 'Classifies maximally entangled GHZ states against general noisy states.',
  [TaskType.W_VS_NON_W]: 'Detects W-family entanglement characteristics in feature sequences.',
  [TaskType.DICKE2_VS_NON_DICKE2]: 'Identifies Dicke states with k=2 excitations.',
  [TaskType.CLUSTER_VS_NON_CLUSTER]: 'Discriminates cluster states used in measurement-based quantum computing.',
  [TaskType.RANDOM_VS_NON_RANDOM]: 'Baseline task: Distinguishes Haar-random states from structured ones.',
};

export const DOMAIN_SLICES: DomainSlice[] = [
  { start: 0, end: 128 },
  { start: 128, end: 256 },
  { start: 256, end: 384 },
  { start: 384, end: 512 },
  { start: 512, end: 640 },
];

export const INITIAL_COERCIVITIES = [0.15, 0.22, 0.18, 0.30, 0.25];
