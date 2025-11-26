import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartPoint } from '../../types';

interface ChartPlotProps {
  data: ChartPoint[];
  config?: {
    xAxisLabel: string;
    yAxisLabel: string;
    showLine?: boolean;
  };
  onPointClick?: (point: ChartPoint) => void;
}

const ChartPlot: React.FC<ChartPlotProps> = ({ data, config, onPointClick }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Reset selection when data changes significantly
  useEffect(() => {
    setSelectedIndex(null);
  }, [data]);

  // Simple Linear Regression approximation for visualization if showLine is true
  const lineData = config?.showLine && data.length > 1 ? calculateRegressionLine(data) : [];

  const handlePointClick = (entry: ChartPoint, index: number) => {
    setSelectedIndex(index);
    if (onPointClick) {
      onPointClick(entry);
    }
  };

  return (
    <div className="w-full h-full bg-slate-800/50 rounded-lg border border-slate-700 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name={config?.xAxisLabel || 'X'} 
            stroke="#94a3b8"
            label={{ value: config?.xAxisLabel || 'X', position: 'bottom', offset: 0, fill: '#94a3b8' }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={config?.yAxisLabel || 'Y'} 
            stroke="#94a3b8"
            label={{ value: config?.yAxisLabel || 'Y', angle: -90, position: 'left', fill: '#94a3b8' }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
          />
          <Scatter name="数据点" data={data} fill="#8884d8">
             {data.map((entry, index) => {
               const isSelected = selectedIndex === index;
               return (
                <Cell 
                  key={`cell-${index}`} 
                  onClick={() => handlePointClick(entry, index)}
                  fill={entry.highlight ? '#facc15' : (entry.group === 'B' ? '#f43f5e' : '#3b82f6')}
                  stroke={isSelected ? '#fff' : 'none'}
                  strokeWidth={isSelected ? 3 : 0}
                  style={{ cursor: 'pointer', filter: isSelected ? 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' : 'none' }}
                />
               );
            })}
          </Scatter>
          
          {config?.showLine && (
              <Scatter data={lineData} line={{ stroke: '#10b981', strokeWidth: 2 }} lineType="fitting" shape={() => <div />} legendType="none" />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

// Helper for simple visualization line
function calculateRegressionLine(data: ChartPoint[]) {
    const n = data.length;
    const sumX = data.reduce((acc, p) => acc + p.x, 0);
    const sumY = data.reduce((acc, p) => acc + p.y, 0);
    const sumXY = data.reduce((acc, p) => acc + p.x * p.y, 0);
    const sumXX = data.reduce((acc, p) => acc + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const minX = Math.min(...data.map(p => p.x));
    const maxX = Math.max(...data.map(p => p.x));

    return [
        { x: minX, y: slope * minX + intercept },
        { x: maxX, y: slope * maxX + intercept }
    ];
}

export default ChartPlot;