
import React from 'react';
import { TrainingLog } from '../../types';

interface Props {
  log: TrainingLog | null;
}

const MetricsGrid: React.FC<Props> = ({ log }) => {
  if (!log) return null;

  const metrics = [
    { label: 'Accuracy', value: (log.acc * 100).toFixed(1) + '%', color: 'text-green-400' },
    { label: 'Precision', value: log.precision.toFixed(3), color: 'text-blue-400' },
    { label: 'Recall', value: log.recall.toFixed(3), color: 'text-purple-400' },
    { label: 'F1 Score', value: log.f1.toFixed(3), color: 'text-pink-400' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((m) => (
        <div key={m.label} className="bg-gray-800/50 p-3 rounded-lg flex flex-col items-center justify-center border border-gray-700/50">
          <span className="text-[10px] uppercase text-gray-500 font-bold mb-1">{m.label}</span>
          <span className={`text-xl font-mono font-bold ${m.color}`}>{m.value}</span>
        </div>
      ))}
    </div>
  );
};

export default MetricsGrid;
