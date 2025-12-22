
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FeatureImportance, AblationResult } from '../../types';

interface Props {
  featureImportance: FeatureImportance[];
  domainContributions: number[];
  ablationResults: AblationResult[];
  activeTask: number;
}

const InterpretabilitiyPanel: React.FC<Props> = ({ featureImportance, domainContributions, ablationResults, activeTask }) => {
  const topFeatures = featureImportance.slice(0, 15);
  
  const contribData = domainContributions.map((val, i) => ({
    name: `D${i}`,
    value: val,
    index: i
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature Importance */}
        <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-xl">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Top 15 Feature Importance</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFeatures} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="featureIdx" type="category" stroke="#9CA3AF" fontSize={10} width={30} tickFormatter={(val) => `F${val}`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="score" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Domain Contribution */}
        <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-xl">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Domain Attribution Score</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contribData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {contribData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === activeTask ? '#10B981' : '#4B5563'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ablation Results */}
      <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-xl">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Ablation Sensitivity Analysis</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {ablationResults.map((res) => (
            <div key={res.domainIdx} className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 flex flex-col items-center">
              <span className="text-[10px] text-gray-500 uppercase font-bold mb-2">Ablate Domain {res.domainIdx}</span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-rose-400 font-mono font-bold text-lg">-{(res.accDrop * 100).toFixed(1)}%</span>
                <span className="text-[10px] text-rose-300 uppercase">Accuracy Delta</span>
              </div>
              <div className="mt-3 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500" 
                  style={{ width: `${Math.min(100, res.accDrop * 200)}%` }} 
                />
              </div>
            </div>
          ))}
          {ablationResults.length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-500 text-xs italic">
              Run ablation study to see impact of domain freezing on metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterpretabilitiyPanel;
