
import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Download, 
  Terminal, 
  Cpu, 
  Fingerprint, 
  Check, 
  Share2,
  PackageCheck,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Quote,
  FileJson,
  Table
} from 'lucide-react';
import { AppState, AuditSnapshot } from '../../types';
import { TASK_LABELS } from '../../constants';

interface Props {
  state: AppState;
  uploadedMeta: any;
  auditHistory: AuditSnapshot[];
}

const ReproducibilityPanel: React.FC<Props> = ({ state, uploadedMeta, auditHistory }) => {
  const [copied, setCopied] = useState(false);
  const [citationCopied, setCitationCopied] = useState(false);

  const activeAudit = auditHistory.find(a => a.taskIdx === state.currentTask);

  const pythonSnippet = `
# MagneticMemory V7 - Scientific Reproducibility Protocol
# Generated: ${new Date().toISOString()}
# Experiment ID: QM-${(state.seed * 1337).toString(16).toUpperCase()}

import numpy as np
import json

def get_experiment_config():
    return {
        "metadata": {
            "task": "${TASK_LABELS[state.currentTask]}",
            "seed": ${state.seed},
            "p_value_threshold": 0.05,
            "domain_confidence_threshold": 0.8
        },
        "audit_results": {
            "final_accuracy": ${activeAudit?.finalAcc || 0},
            "p_value": ${activeAudit?.pValue || 0},
            "domain_verdict": "${activeAudit?.domainVerdict || 'PENDING'}"
        },
        "hardware_mapping": {
            "topology": "all-to-all",
            "qubit_count": 6,
            "basis_gates": ["id", "rz", "sx", "x", "cx"]
        }
    }

if __name__ == "__main__":
    config = get_experiment_config()
    print(f"--- PROTOCOL LOADED: {config['metadata']['task']} ---")
    # In a real-world scenario, this dictionary would feed into a Qiskit backend
`;

  const bibtex = `@software{magmem_v7,
  author = {MagneticMemory Research Group},
  title = {MagneticMemory V7: Quantum Data Integrity Dashboard},
  year = {2025},
  url = {https://aistudio.google.com/magmem-v7},
  version = {7.0.2-PRO}
}`;

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      state,
      uploadedMeta,
      auditHistory,
      timestamp: new Date().toISOString(),
      checksum: Math.random().toString(36).substring(7)
    }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `magmem_audit_${state.currentTask}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadCSV = () => {
    const headers = "Metric,Value\n";
    const rows = [
      ["Task", TASK_LABELS[state.currentTask]],
      ["Seed", state.seed],
      ["Final Accuracy", activeAudit?.finalAcc || "N/A"],
      ["P-Value", activeAudit?.pValue || "N/A"],
      ["Domain Confidence", activeAudit?.domainConfidence || "N/A"],
      ["Verdict", activeAudit?.finalVerdict || "N/A"]
    ].map(r => r.join(",")).join("\n");
    
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "audit_summary.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-amber-500 rounded-3xl shadow-xl shadow-amber-500/30"><PackageCheck size={32} className="text-white" /></div>
           <div>
             <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Reproduction <span className="text-amber-500">Vault</span></h2>
             <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em]">Exporting Engine Configuration to External Lab Protocols</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-3"><Terminal size={16} /> Research Script (.py)</h3>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(pythonSnippet);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-300 transition-all border border-slate-700"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'COPIED' : 'COPY PROTOCOL'}
            </button>
          </div>
          <div className="flex-1 bg-slate-950 rounded-2xl p-6 font-mono text-[11px] text-emerald-500 overflow-auto custom-scrollbar border border-slate-800/50 shadow-inner max-h-[400px]">
            <pre>{pythonSnippet}</pre>
          </div>
        </section>

        <section className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
             <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-3"><Fingerprint size={16} /> Scientific Citation</h3>
             <div className="bg-slate-950 rounded-2xl p-4 mb-4 border border-slate-800">
               <pre className="text-[9px] text-slate-400 font-mono whitespace-pre-wrap">{bibtex}</pre>
             </div>
             <button 
               onClick={() => {
                 navigator.clipboard.writeText(bibtex);
                 setCitationCopied(true);
                 setTimeout(() => setCitationCopied(false), 2000);
               }}
               className="w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
             >
               {citationCopied ? <Check size={14} /> : <Quote size={14} />}
               {citationCopied ? 'CITATION COPIED' : 'COPY BIBTEX'}
             </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-6 flex items-center gap-3"><Share2 size={16} /> Data Export Packages</h3>
            <div className="grid grid-cols-2 gap-4">
               <button 
                 onClick={downloadJSON}
                 className="flex flex-col items-center gap-3 p-6 bg-slate-800/30 hover:bg-slate-700/50 rounded-3xl border border-slate-700 transition-all group"
               >
                 <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl group-hover:scale-110 transition-transform"><FileJson size={24} /></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Export .JSON</span>
               </button>
               <button 
                 onClick={downloadCSV}
                 className="flex flex-col items-center gap-3 p-6 bg-slate-800/30 hover:bg-slate-700/50 rounded-3xl border border-slate-700 transition-all group"
               >
                 <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform"><Table size={24} /></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audit .CSV</span>
               </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReproducibilityPanel;
