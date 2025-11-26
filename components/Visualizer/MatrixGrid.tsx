import React, { useState, useEffect } from 'react';
import { MatrixCell } from '../../types';
import { motion } from 'framer-motion';

interface MatrixGridProps {
  matrix: MatrixCell[][];
  onCellClick?: (cell: MatrixCell, row: number, col: number) => void;
}

const MatrixGrid: React.FC<MatrixGridProps> = ({ matrix, onCellClick }) => {
  const [selected, setSelected] = useState<{r: number, c: number} | null>(null);

  // Reset selection on matrix update
  useEffect(() => {
    setSelected(null);
  }, [matrix]);

  if (!matrix || matrix.length === 0) return <div className="text-slate-500">暂无矩阵数据</div>;

  const rows = matrix.length;
  const cols = matrix[0].length;

  const handleCellClick = (cell: MatrixCell, r: number, c: number) => {
    setSelected({ r, c });
    if (onCellClick) {
      onCellClick(cell, r, c);
    }
  };

  return (
    <div className="w-full h-full bg-slate-800/50 rounded-lg border border-slate-700 p-6 flex items-center justify-center">
      <div 
        className="grid gap-1" 
        style={{ 
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: `${cols}/${rows}`
        }}
      >
        {matrix.map((row, rIdx) => 
          row.map((cell, cIdx) => {
            const isSelected = selected?.r === rIdx && selected?.c === cIdx;
            return (
              <motion.div
                key={`${rIdx}-${cIdx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (rIdx * cols + cIdx) * 0.02 }}
                onClick={() => handleCellClick(cell, rIdx, cIdx)}
                className={`
                  relative flex items-center justify-center rounded cursor-pointer transition-all
                  ${isSelected ? 'ring-2 ring-white z-20 shadow-lg scale-110' : ''}
                  ${cell.highlight && !isSelected ? 'ring-2 ring-yellow-400 z-10' : 'border border-slate-600/30 hover:border-white/50'}
                `}
                style={{
                  backgroundColor: `rgba(59, 130, 246, ${Math.max(0.1, Math.min(1, cell.value))})`, // Blue scale based on value
                  color: cell.value > 0.5 ? 'white' : '#94a3b8',
                }}
                title={`Value: ${cell.value}`}
              >
                <span className={`text-xs font-mono ${isSelected ? 'font-bold' : ''}`}>
                    {cell.value.toFixed(2)}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MatrixGrid;