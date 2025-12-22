
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrainingLog } from '../../types';

interface Props {
  logs: TrainingLog[];
}

const LossChart: React.FC<Props> = ({ logs }) => {
  return (
    <div className="h-64 w-full bg-gray-800/50 rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-400">Training Dynamics</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={logs}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="epoch" stroke="#9CA3AF" fontSize={12} />
          <YAxis yAxisId="left" stroke="#3B82F6" fontSize={12} />
          <YAxis yAxisId="right" orientation="right" stroke="#10B981" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend iconType="circle" />
          <Line yAxisId="left" type="monotone" dataKey="loss" stroke="#3B82F6" name="Loss" dot={false} strokeWidth={2} isAnimationActive={false} />
          <Line yAxisId="right" type="monotone" dataKey="acc" stroke="#10B981" name="Accuracy" dot={false} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LossChart;
