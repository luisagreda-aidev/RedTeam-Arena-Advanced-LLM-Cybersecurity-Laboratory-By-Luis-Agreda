
import React from 'react';

interface AgentCardProps {
  name: string;
  role: 'ADVERSARY' | 'GUARDIAN';
  status: 'IDLE' | 'THINKING' | 'ATTACKING' | 'DEFENDING';
  description: string;
  color: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ name, role, status, description, color }) => {
  const isAdversary = role === 'ADVERSARY';
  
  return (
    <div className={`p-6 rounded-xl glass-panel border-t-4 ${color} transition-all duration-300 ${status !== 'IDLE' ? 'scale-105' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight">{name}</h3>
          <span className={`text-xs font-mono px-2 py-0.5 rounded uppercase ${isAdversary ? 'bg-red-900/40 text-red-400' : 'bg-blue-900/40 text-blue-400'}`}>
            {role}
          </span>
        </div>
        <div className={`w-3 h-3 rounded-full ${status === 'IDLE' ? 'bg-gray-600' : 'animate-pulse ' + (isAdversary ? 'bg-red-500' : 'bg-blue-500')}`} />
      </div>
      <p className="text-sm text-gray-400 mb-6 h-12 overflow-hidden">
        {description}
      </p>
      
      <div className="flex items-center gap-3">
        <div className={`flex-1 h-2 rounded-full bg-gray-800 overflow-hidden`}>
          <div 
            className={`h-full transition-all duration-1000 ${isAdversary ? 'bg-red-500' : 'bg-blue-500'}`} 
            style={{ width: status === 'IDLE' ? '0%' : '100%' }}
          />
        </div>
        <span className="text-[10px] font-mono text-gray-500">{status}</span>
      </div>
    </div>
  );
};

export default AgentCard;
