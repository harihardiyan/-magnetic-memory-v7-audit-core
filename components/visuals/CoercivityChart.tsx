
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  coercivities: number[];
  activeTask: number;
}

const CoercivityChart: React.FC<Props> = ({ coercivities, activeTask }) => {
  const data = coercivities.map((val, i) => ({
    name: `D${i}`,
    value: parseFloat(val.toFixed(3)),
    index: i
  }));

  return (
    <div className="h-48 w-full bg-gray-800/50 rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-400">Per-Domain Coercivity</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
          <YAxis stroke="#9CA3AF" fontSize={10} domain={[0, 0.5]} />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === activeTask ? '#F59E0B' : '#6B7280'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CoercivityChart;
