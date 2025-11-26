import React, { useState, useEffect } from 'react';
import { NodeData, EdgeData } from '../../types';
import { motion } from 'framer-motion';

interface FlowDiagramProps {
  nodes: NodeData[];
  edges: EdgeData[];
  onNodeClick?: (node: NodeData) => void;
}

const FlowDiagram: React.FC<FlowDiagramProps> = ({ nodes, edges, onNodeClick }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Reset selection when nodes change (e.g. new step)
  useEffect(() => {
    setSelectedId(null);
  }, [nodes]);

  const getNodeColor = (type?: string, highlight?: boolean) => {
    if (highlight) return '#facc15'; // Yellow-400
    switch (type) {
      case 'input': return '#3b82f6'; // Blue-500
      case 'output': return '#10b981'; // Green-500
      case 'operation': return '#f97316'; // Orange-500
      default: return '#64748b'; // Slate-500
    }
  };

  const handleNodeClick = (node: NodeData) => {
    setSelectedId(node.id);
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  return (
    <div className="w-full h-full bg-slate-800/50 rounded-lg border border-slate-700 relative overflow-hidden flex items-center justify-center p-4">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="5" refY="1.75" orient="auto">
            <polygon points="0 0, 5 1.75, 0 3.5" fill="#94a3b8" />
          </marker>
             <marker id="arrowhead-active" markerWidth="5" markerHeight="3.5" refX="5" refY="1.75" orient="auto">
            <polygon points="0 0, 5 1.75, 0 3.5" fill="#facc15" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge, idx) => {
          const start = nodes.find(n => n.id === edge.from);
          const end = nodes.find(n => n.id === edge.to);
          if (!start || !end) return null;

          return (
            <g key={`edge-${idx}`}>
              <motion.line
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={edge.active ? "#facc15" : "#475569"}
                strokeWidth={edge.active ? 0.8 : 0.4}
                markerEnd={edge.active ? "url(#arrowhead-active)" : "url(#arrowhead)"}
              />
              {edge.label && (
                <text
                  x={( (start.x || 0) + (end.x || 0) ) / 2}
                  y={( (start.y || 0) + (end.y || 0) ) / 2 - 1}
                  fontSize="3"
                  fill="#cbd5e1"
                  textAnchor="middle"
                  className="bg-slate-900"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedId === node.id;
          return (
            <motion.g
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={() => handleNodeClick(node)}
              className="cursor-pointer hover:opacity-80"
              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
            >
              {/* Selection Ring */}
              {isSelected && (
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={highlightToRadius(node.highlight) + 2}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="0.8"
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                />
              )}
              
              <circle
                cx={node.x}
                cy={node.y}
                r={highlightToRadius(node.highlight)}
                fill={getNodeColor(node.type, node.highlight)}
                stroke="#1e293b"
                strokeWidth="0.5"
              />
              <text
                x={node.x}
                y={(node.y || 0) + highlightToRadius(node.highlight) + 4}
                fontSize="3.5"
                fill={isSelected ? "#fff" : "#f1f5f9"}
                textAnchor="middle"
                fontWeight={node.highlight || isSelected ? "bold" : "normal"}
                style={{ pointerEvents: 'none' }}
              >
                {node.label}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
};

const highlightToRadius = (h?: boolean) => h ? 6 : 4;

export default FlowDiagram;