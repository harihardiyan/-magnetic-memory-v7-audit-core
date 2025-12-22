
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Download, 
  Info, 
  Database, 
  Activity, 
  Cpu, 
  Layers,
  ChevronRight,
  ShieldAlert,
  Zap,
  Eye,
  Microscope,
  FileCode,
  CheckCircle2,
  ShieldCheck,
  Binary,
  Upload,
  FileText,
  AlertCircle,
  PackageCheck
} from 'lucide-react';
import { AppState, TaskType, TrainingLog, AuditSnapshot } from './types';
import { TASK_LABELS, TASK_DESCRIPTIONS, INITIAL_COERCIVITIES } from './constants';
import { 
  simulateEpoch, 
  generateInitialMemory, 
  updateMemory, 
  calculateFeatureImportance, 
  calculateDomainAttribution, 
  runAblationStudy,
  generateAuditSnapshot
} from './logic/simulator';
import LossChart from './components/visuals/LossChart';
import MemoryHeatmap from './components/visuals/MemoryHeatmap';
import CoercivityChart from './components/visuals/CoercivityChart';
import MetricsGrid from './components/visuals/MetricsGrid';
import InterpretabilitiyPanel from './components/visuals/InterpretabilitiyPanel';
import AuditPanel from './components/visuals/AuditPanel';
import ReproducibilityPanel from './components/visuals/ReproducibilityPanel';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'training' | 'interpretabilitiy' | 'audit' | 'reproducibility'>('training');
  const [uploadedMeta, setUploadedMeta] = useState<{ 
    ndim: number; 
    size: number; 
    norm: number; 
    isComplex: boolean; 
    maxVal: number; 
    name: string; 
    entropy: number;
    semanticScore: number;
    variance: number;
  } | null>(null);
  
  const [state, setState] = useState<AppState>({
    isTraining: false,
    currentTask: TaskType.GHZ_VS_NON_GHZ,
    logs: [],
    memory: generateInitialMemory(),
    seed: 42,
    datasetSize: 1000,
    featureImportance: [],
    domainContributions: [],
    ablationResults: [],
    auditHistory: [],
    isAuditing: false
  });

  const trainingInterval = useRef<number | null>(null);

  const startTraining = useCallback(() => {
    if (state.isTraining) return;
    setState(prev => ({ 
      ...prev, 
      isTraining: true,
      logs: [],
      featureImportance: [],
      domainContributions: [],
      ablationResults: []
    }));
  }, [state.isTraining]);

  const resetAll = useCallback(() => {
    if (trainingInterval.current) window.clearInterval(trainingInterval.current);
    trainingInterval.current = null;
    setState({
      isTraining: false,
      currentTask: TaskType.GHZ_VS_NON_GHZ,
      logs: [],
      memory: generateInitialMemory(),
      seed: 42,
      datasetSize: 1000,
      featureImportance: [],
      domainContributions: [],
      ablationResults: [],
      auditHistory: [],
      isAuditing: false
    });
    setUploadedMeta(null);
    setActiveTab('training');
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n').filter(l => l.trim());
      
      const upperContent = content.toUpperCase();
      
      const quantumKeywords = ["QUBIT", "ENTANGLEMENT", "TRL", "FEASIBILITY", "ALGORITHM", "FIDELITY", "SHOR", "GROVER", "GHZ", "BELL STATE", "HILBERT"];
      let matchCount = 0;
      quantumKeywords.forEach(k => { if(upperContent.includes(k)) matchCount++; });
      const semanticScore = Math.min(1.0, matchCount / 4);

      let ndim = 2;
      let size = lines.length > 0 ? lines[0].split(',').length : 0;
      let maxVal = 0.0;
      let allValues: number[] = [];

      lines.slice(0, 100).forEach(line => {
        const parts = line.split(',').map(v => parseFloat(v)).filter(v => !isNaN(v));
        allValues.push(...parts);
      });

      if (allValues.length > 0) {
        maxVal = Math.max(...allValues.map(v => Math.abs(v)));
      }

      const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length || 0;
      const variance = allValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allValues.length || 0;
      
      let isComplex = upperContent.includes('J') || upperContent.includes('COMPLEX');
      let entropy = 4.2;

      if (variance > 10.0 && semanticScore < 0.2) {
        entropy = 5.95;
      }

      setUploadedMeta({
        ndim,
        size,
        norm: 1.0, 
        isComplex,
        maxVal,
        name: file.name,
        entropy,
        semanticScore,
        variance
      });
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (state.isTraining) {
      trainingInterval.current = window.setInterval(() => {
        setState(prev => {
          if (prev.logs.length >= 20) {
            if (trainingInterval.current) window.clearInterval(trainingInterval.current);
            trainingInterval.current = null;
            
            setTimeout(() => {
              const snapshot = generateAuditSnapshot(prev.currentTask, prev.logs, uploadedMeta);
              setState(s => ({
                ...s,
                auditHistory: [...s.auditHistory.filter(a => a.taskIdx !== s.currentTask), snapshot],
                isAuditing: false
              }));
            }, 1500);

            return { 
              ...prev, 
              isTraining: false,
              isAuditing: true,
              featureImportance: calculateFeatureImportance(prev.currentTask),
              domainContributions: calculateDomainAttribution(prev.currentTask),
              ablationResults: runAblationStudy(prev.currentTask)
            };
          }
          return {
            ...prev,
            logs: [...prev.logs, simulateEpoch(prev.logs.length + 1, prev.logs[prev.logs.length-1] || null, prev.currentTask, prev.seed)],
            memory: updateMemory(prev.memory, prev.currentTask)
          };
        });
      }, 200);
    }
    return () => { if (trainingInterval.current) window.clearInterval(trainingInterval.current); };
  }, [state.isTraining, uploadedMeta]);

  const currentAudit = state.auditHistory.find(a => a.taskIdx === state.currentTask) || null;

  return (
    <div className="flex h-screen w-full bg-slate-950 font-sans text-slate-200">
      <aside className="w-80 border-r border-slate-800 bg-slate-900 flex flex-col overflow-y-auto shadow-2xl z-20">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30">
              <Binary size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase">MAGMEM <span className="text-indigo-500">V7</span></h1>
          </div>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Scientific Audit Core 7.0</p>
        </div>

        <div className="p-8 space-y-8 flex-1">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <Database size={12} /> Domain Guardrail
            </div>
            <div className="space-y-4">
              <label className={`block p-4 border rounded-2xl cursor-pointer transition-all border-dashed ${uploadedMeta ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/50'}`}>
                <div className="flex flex-col items-center gap-2">
                  <Upload size={20} className={uploadedMeta ? 'text-indigo-400' : 'text-slate-600'} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">
                    {uploadedMeta ? uploadedMeta.name : 'Upload Quantum Dataset'}
                  </span>
                </div>
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={state.isTraining} />
              </label>

              {uploadedMeta && (
                <div className={`p-3 rounded-xl border text-[10px] font-bold uppercase tracking-tighter space-y-1 ${uploadedMeta.semanticScore < 0.3 || (uploadedMeta.maxVal > 1000) ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                  <div className="flex justify-between"><span>Semantic Proof</span><span>{(uploadedMeta.semanticScore * 100).toFixed(0)}%</span></div>
                  <div className="flex justify-between"><span>Value Integrity</span><span>{uploadedMeta.maxVal > 1000 ? 'SUSPICIOUS' : 'PLAUSIBLE'}</span></div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-600 font-black uppercase">Samples</label>
                  <input type="number" value={state.datasetSize} onChange={(e) => setState(prev => ({ ...prev, datasetSize: parseInt(e.target.value) || 1000 }))} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono" disabled={state.isTraining} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-600 font-black uppercase">Seed</label>
                  <input type="number" value={state.seed} onChange={(e) => setState(prev => ({ ...prev, seed: parseInt(e.target.value) || 42 }))} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono" disabled={state.isTraining} />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <Zap size={12} /> Target Family
            </div>
            <select value={state.currentTask} onChange={(e) => setState(prev => ({ ...prev, currentTask: parseInt(e.target.value) }))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold" disabled={state.isTraining}>
              {Object.entries(TASK_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </section>

          <div className="pt-6 space-y-3">
            <button onClick={startTraining} disabled={state.isTraining} className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${state.isTraining ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20'}`}>
              <Play size={16} fill="currentColor" /> {state.isTraining ? 'Engine Running...' : 'Launch V7 Audit'}
            </button>
            <button onClick={resetAll} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-800 text-slate-400 hover:bg-slate-700 transition-all"><RotateCcw size={16} /> Reset Engine</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
        <header className="h-20 border-b border-slate-900 flex items-center justify-between px-10 bg-slate-900/40 backdrop-blur-xl z-10">
          <div className="flex gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800">
            {['training', 'interpretabilitiy', 'audit', 'reproducibility'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === tab ? `bg-indigo-600 text-white shadow-lg shadow-indigo-600/20` : 'text-slate-500 hover:bg-slate-800/50'}`}>
                {tab === 'training' && <Activity size={14} className="inline mr-2" />}
                {tab === 'interpretabilitiy' && <Eye size={14} className="inline mr-2" />}
                {tab === 'audit' && <ShieldCheck size={14} className="inline mr-2" />}
                {tab === 'reproducibility' && <PackageCheck size={14} className="inline mr-2" />}
                {tab}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {activeTab === 'training' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8"><LossChart logs={state.logs} /><MemoryHeatmap memory={state.memory} domainIdx={state.currentTask} /></div>
                <div className="space-y-8"><MetricsGrid log={state.logs[state.logs.length-1] || null} /><CoercivityChart coercivities={state.logs[state.logs.length-1]?.coercivities || INITIAL_COERCIVITIES} activeTask={state.currentTask} /></div>
              </div>
            </div>
          )}
          {activeTab === 'interpretabilitiy' && <InterpretabilitiyPanel featureImportance={state.featureImportance} domainContributions={state.domainContributions} ablationResults={state.ablationResults} activeTask={state.currentTask} />}
          {activeTab === 'audit' && <AuditPanel currentAudit={currentAudit} auditHistory={state.auditHistory} logs={state.logs} onExportJSON={() => {}} onExportSummaryCSV={() => {}} isAuditing={state.isAuditing} />}
          {activeTab === 'reproducibility' && <ReproducibilityPanel state={state} uploadedMeta={uploadedMeta} auditHistory={state.auditHistory} />}
        </div>
      </main>
    </div>
  );
};

export default App;
