import React from 'react';
import { AlertTriangle, Lightbulb } from 'lucide-react';
import { Insight } from '../types';

interface InsightsBarProps {
  insights: Insight[];
}

const InsightsBar: React.FC<InsightsBarProps> = ({ insights }) => {
  if (insights.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      {insights.map((insight) => (
        <div 
            key={insight.id} 
            className={`
                rounded-2xl p-4 border flex items-start gap-3 animate-fade-in
                ${insight.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' : ''}
                ${insight.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : ''}
                ${insight.severity === 'info' ? 'bg-blue-500/10 border-blue-500/30 text-blue-200' : ''}
            `}
        >
            {insight.severity === 'critical' || insight.severity === 'warning' ? <AlertTriangle size={20} className="shrink-0 mt-1"/> : <Lightbulb size={20} className="shrink-0 mt-1"/>}
            <div>
                <h4 className="font-bold text-sm mb-1">{insight.title}</h4>
                <p className="text-xs opacity-80">{insight.message}</p>
            </div>
        </div>
      ))}
    </div>
  );
};

export default InsightsBar;