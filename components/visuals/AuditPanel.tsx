
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine
} from 'recharts';
import { AuditSnapshot, TrainingLog } from '../../types';
import { TASK_LABELS } from '../../constants';
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileJson, 
  FileSpreadsheet, 
  Activity, 
  Database,
  Search,
  Fingerprint,
  Zap,
  Check,
  X,
  Scale,
  Atom,
  SearchCode,
  Target,
  FileSearch,
  AlertTriangle
} from 'lucide-react';

interface Props {
  currentAudit: AuditSnapshot | null;
  auditHistory: AuditSnapshot[];
  logs: TrainingLog[];
  onExportJSON: () => void;
  onExportSummaryCSV: () => void;
  isAuditing: boolean;
}

const AuditPanel: React.FC<Props> = ({ currentAudit, auditHistory, logs, onExportJSON, onExportSummaryCSV, isAuditing }) => {
  
  const histogramData = useMemo(() => {
    if (!currentAudit) return [];
    const bins = 15;
    const min = 0.4;
    const max = 0.7;
    const step = (max - min) / bins;
    const counts = new Array(bins).fill(0);
    currentAudit.nullDistribution.forEach(val => {
      const b = Math.min(bins - 1, Math.max(0, Math.floor((val - min) / step)));
      counts[b]++;
    });
    return counts.map((count, i) => ({ range: `${(min + i * step).toFixed(2)}`, count }));
  }, [currentAudit]);

  const THRESHOLD = 0.8;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-600/30"><ShieldCheck size={32} className="text-white" /></div>
           <div>
             <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Audit V7 <span className="text-indigo-500">Integrity Matrix</span></h2>
             <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em]">Anti-Spoofing Protocol: Numerical Plausibility Verified</p>
           </div>
        </div>
      </div>

      {currentAudit && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Predicted Domain Panel */}
          <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-xl flex flex-col">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-8 flex items-center gap-3"><FileSearch size={16} /> Inference Engine</h3>
            <div className={`p-6 rounded-2xl border text-center mb-6 ${currentAudit.domainConfidence >= THRESHOLD && !currentAudit.predictedDomain.includes('Noise') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              <span className="text-[10px] uppercase font-black opacity-50 block mb-1">Classification Verdict</span>
              <p className="text-2xl font-black uppercase tracking-tighter">{currentAudit.predictedDomain}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Target size={12} />
                <span className="text-xs font-mono font-bold">{(currentAudit.domainConfidence * 100).toFixed(1)}% Confidence</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[11px] p-2 border-b border-slate-800">
                <span className="text-slate-500 uppercase tracking-widest text-[9px]">Semantic Proof</span>
                <span className="text-indigo-400 font-mono">
                  {( (currentAudit.metaFeatures as any).semanticScore * 100 ).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-[11px] p-2 border-b border-slate-800">
                <span className="text-slate-500 uppercase tracking-widest text-[9px]">Value Integrity</span>
                <span className={currentAudit.metaFeatures.maxVal > 1000 ? 'text-rose-400' : 'text-emerald-400'}>
                  {currentAudit.metaFeatures.maxVal > 1000 ? 'ABSURD' : 'PLAUSIBLE'}
                </span>
              </div>
              <div className="flex justify-between text-[11px] p-2 border-b border-slate-800">
                <span className="text-slate-500 uppercase tracking-widest text-[9px]">Numerical Variance</span>
                <span className="text-slate-300 font-mono">{(currentAudit.metaFeatures as any).variance.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Domain Verdict Panel */}
          <section className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-xl flex flex-col">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-8 flex items-center gap-3"><Database size={16} /> Domain Verdict</h3>
            <div className={`p-8 rounded-3xl border text-center ${currentAudit.domainVerdict === 'VALID_DOMAIN' ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-500' : 'bg-rose-500/5 border-rose-500/30 text-rose-500'}`}>
              <p className="text-3xl font-black">{currentAudit.domainVerdict}</p>
            </div>
            <div className="mt-8 space-y-4">
               <div className="flex justify-between text-[11px] font-bold"><span>Anti-Spoofing Check</span>{currentAudit.domainConfidence >= THRESHOLD && !currentAudit.predictedDomain.includes('Noise') ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-rose-500" />}</div>
               <div className="flex justify-between text-[11px] font-bold"><span>Physical Range Match</span>{currentAudit.metaFeatures.maxVal < 100 ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-rose-500" />}</div>
               <div className="flex justify-between text-[11px] font-bold"><span>Dimensionality Gate</span>{currentAudit.hilbertDimMatch || currentAudit.predictedDomain === 'Quantum Metadata' ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-rose-500" />}</div>
            </div>
            {currentAudit.domainReasons.length > 0 && (
              <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-400 font-mono leading-relaxed">
                {currentAudit.domainReasons.map((r, i) => <div key={i} className="flex gap-2"><AlertTriangle size={10} className="shrink-0" /> {r}</div>)}
              </div>
            )}
          </section>

          {/* Statistical Verdict Panel */}
          <section className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-xl flex flex-col">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-8 flex items-center gap-3"><Activity size={16} /> Statistical Verdict</h3>
            <div className={`p-8 rounded-3xl border text-center ${currentAudit.statVerdict === 'VALID_STAT' ? 'bg-blue-500/5 border-blue-500/30 text-blue-500' : 'bg-rose-500/5 border-rose-500/30 text-rose-500'}`}>
              <p className="text-3xl font-black">{currentAudit.statVerdict}</p>
            </div>
            <div className="mt-6 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-black">P-Value Null-Acc Gain</span>
              <p className="text-4xl font-mono text-white">{(currentAudit.pValue).toFixed(4)}</p>
            </div>
            <div className="flex-1 mt-6">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={histogramData}><Bar dataKey="count" fill="#3b82f6" opacity={0.6} /><ReferenceLine x={(currentAudit.finalAcc).toFixed(2)} stroke="#f43f5e" strokeWidth={2} /></BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}

      {currentAudit && (
        <section className={`bg-slate-900 border rounded-[3rem] p-12 shadow-2xl relative overflow-hidden text-center ${currentAudit.finalVerdict === 'VALID' ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent opacity-20" />
          <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">Final Protocol Conclusion</p>
          <p className={`text-8xl font-black tracking-tighter ${currentAudit.finalVerdict === 'VALID' ? 'text-emerald-500' : 'text-rose-500'}`}>{currentAudit.finalVerdict}</p>
          <p className="mt-8 max-w-2xl mx-auto text-slate-400 font-medium leading-relaxed">
            {currentAudit.finalVerdict === 'VALID' 
              ? `Dual-verdict satisfied: Model verified ${currentAudit.predictedDomain} via cross-validation of semantic terminology and numerical plausibility.` 
              : `Audit failure: ${currentAudit.predictedDomain === 'Adversarial Noise' ? "Adversarial spoofing detected." : "Insufficient proof found."} The numerical ranges provided do not reflect a real quantum environment.`}
          </p>
        </section>
      )}
    </div>
  );
};

export default AuditPanel;
