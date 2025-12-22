
import React, { useRef, useEffect } from 'react';
import { MemoryState } from '../../types';

interface Props {
  memory: MemoryState;
  domainIdx: number;
}

const MemoryHeatmap: React.FC<Props> = ({ memory, domainIdx }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { start, end } = memory.slices[domainIdx];
    const sliceWidth = end - start;
    const numSamples = memory.matrix.length;
    
    // Scale mapping
    const cellWidth = canvas.width / sliceWidth;
    const cellHeight = canvas.height / numSamples;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    memory.matrix.forEach((row, y) => {
      for (let x = 0; x < sliceWidth; x++) {
        const val = row[start + x];
        // Normalized color (0 to 1)
        const intensity = Math.min(1, Math.max(0, (val + 0.5))); 
        const r = Math.floor(intensity * 100 + 30);
        const g = Math.floor(intensity * 180 + 50);
        const b = Math.floor(intensity * 255);
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    });
  }, [memory, domainIdx]);

  return (
    <div className="w-full bg-gray-800/50 rounded-lg p-4 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-400">Memory Domain {domainIdx} Activation</h3>
        <span className="text-xs text-gray-500">Units: {memory.slices[domainIdx].start}-{memory.slices[domainIdx].end}</span>
      </div>
      <div className="relative w-full aspect-[4/1] bg-black rounded overflow-hidden shadow-inner">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={100} 
          className="w-full h-full"
        />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 to-cyan-400 opacity-50" />
      </div>
      <div className="w-full flex justify-between mt-2 text-[10px] text-gray-500 uppercase tracking-widest">
        <span>Feature Latent Start</span>
        <span>Feature Latent End</span>
      </div>
    </div>
  );
};

export default MemoryHeatmap;
