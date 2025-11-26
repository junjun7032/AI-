import React, { useState, useEffect } from 'react';
import { AlgorithmExplanation, VisualType, NodeData, ChartPoint, MatrixCell } from '../types';
import { Play, Pause, SkipBack, SkipForward, HelpCircle } from 'lucide-react';
import FlowDiagram from './Visualizer/FlowDiagram';
import ChartPlot from './Visualizer/ChartPlot';
import MatrixGrid from './Visualizer/MatrixGrid';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AlgorithmPlayerProps {
  data: AlgorithmExplanation;
  onStepChange: (stepIndex: number) => void;
  onTermClick: (term: string) => void;
}

const AlgorithmPlayer: React.FC<AlgorithmPlayerProps> = ({ data, onStepChange, onTermClick }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < data.steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 5000); // Increased duration to 5s to allow reading
    }
    return () => clearInterval(interval);
  }, [isPlaying, data.steps.length]);

  useEffect(() => {
      onStepChange(currentStepIndex);
  }, [currentStepIndex, onStepChange]);

  const handleNext = () => {
    if (currentStepIndex < data.steps.length - 1) setCurrentStepIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
  };

  // Handlers for visual element clicks
  const handleNodeClick = (node: NodeData) => {
    onTermClick(`可视化节点 "${node.label}" (Type: ${node.type})`);
  };

  const handlePointClick = (point: ChartPoint) => {
    onTermClick(`数据点 (X:${point.x.toFixed(2)}, Y:${point.y.toFixed(2)}) ${point.group ? `[组 ${point.group}]` : ''}`);
  };

  const handleCellClick = (cell: MatrixCell, r: number, c: number) => {
    onTermClick(`矩阵单元格 [${r}, ${c}] (Value: ${cell.value.toFixed(4)}) ${cell.label ? `[${cell.label}]` : ''}`);
  };

  const currentStep = data.steps[currentStepIndex];

  const renderVisualizer = () => {
    const vData = currentStep.visualData;
    switch (vData.type) {
      case VisualType.FLOW:
        return (
          <FlowDiagram 
            nodes={vData.nodes || []} 
            edges={vData.edges || []} 
            onNodeClick={handleNodeClick}
          />
        );
      case VisualType.CHART:
        return (
          <ChartPlot 
            data={vData.chartData || []} 
            config={vData.chartConfig} 
            onPointClick={handlePointClick}
          />
        );
      case VisualType.MATRIX:
        return (
          <MatrixGrid 
            matrix={vData.matrix || []} 
            onCellClick={handleCellClick}
          />
        );
      default:
        return <div className="text-center text-slate-400">暂无可视化数据</div>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Visualization Screen */}
      <div className="flex-1 relative p-4 min-h-[350px] bg-slate-900/30">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full h-full"
          >
            {renderVisualizer()}
          </motion.div>
        </AnimatePresence>
        
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full border border-slate-700 text-xs text-slate-300 shadow-lg">
          步骤 {currentStep.stepNumber} / {data.steps.length}
        </div>
      </div>

      {/* Controls & Explanation */}
      <div className="bg-slate-900 border-t border-slate-800 p-6 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] z-10">
        
        {/* Playback Controls */}
        <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <span className="bg-blue-600/20 text-blue-400 border border-blue-600/50 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">{currentStep.visualData.type}</span>
               {currentStep.title}
            </h3>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                    className="p-2 rounded-full hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition active:scale-95"
                    title="上一步"
                >
                    <SkipBack size={20} />
                </button>
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center"
                    title={isPlaying ? "暂停" : "播放"}
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
                <button 
                    onClick={handleNext}
                    disabled={currentStepIndex === data.steps.length - 1}
                    className="p-2 rounded-full hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition active:scale-95"
                    title="下一步"
                >
                    <SkipForward size={20} />
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
                {/* Markdown Description */}
                <div className="markdown-content text-slate-300 text-sm md:text-base leading-relaxed max-h-[150px] overflow-y-auto pr-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {currentStep.description}
                    </ReactMarkdown>
                </div>
            </div>

            {/* Key Terms / Interactive Elements */}
            {currentStep.keyTerms && currentStep.keyTerms.length > 0 && (
                <div className="md:w-48 flex-shrink-0 flex flex-col gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                    <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <HelpCircle size={12} /> 关键概念 (点击提问)
                    </span>
                    <div className="flex flex-wrap md:flex-col gap-2">
                        {currentStep.keyTerms.map((term, idx) => (
                            <button
                                key={idx}
                                onClick={() => onTermClick(term)}
                                className="text-left text-xs bg-slate-800 hover:bg-slate-700 hover:text-blue-300 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 transition flex items-center justify-between group"
                            >
                                {term}
                                <span className="opacity-0 group-hover:opacity-100 text-blue-500 text-[10px]">?</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1 mt-6 rounded-full overflow-hidden">
            <div 
                className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-500 ease-out" 
                style={{ width: `${((currentStepIndex + 1) / data.steps.length) * 100}%` }}
            />
        </div>
      </div>
    </div>
  );
};

export default AlgorithmPlayer;