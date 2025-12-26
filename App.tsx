
import React, { useState, useEffect, useRef } from 'react';
import { Shield, Skull, Activity, AlertTriangle, Zap, Terminal, RefreshCw, BarChart3, ChevronRight, Cpu, User, BrainCircuit } from 'lucide-react';
import { RedTeamService } from './services/geminiService';
import { AttackType, Message, SecurityLevel, SessionStats, SupportedModel } from './types';
import AgentCard from './components/AgentCard';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const App: React.FC = () => {
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>(SecurityLevel.MEDIUM);
  const [adversaryModel, setAdversaryModel] = useState<SupportedModel>('gemini-3-pro-preview');
  const [guardianModel, setGuardianModel] = useState<SupportedModel>('gemini-3-pro-preview');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [attackHistory, setAttackHistory] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAttack, setActiveAttack] = useState<AttackType | null>(null);
  const [stats, setStats] = useState<SessionStats>({
    totalAttacks: 0,
    successfulInjections: 0,
    thwartedAttempts: 0,
    averageRobustnessScore: 0
  });
  const [robustnessHistory, setRobustnessHistory] = useState<{name: string, score: number}[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const redTeamService = useRef(new RedTeamService());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (sender: Message['sender'], text: string, metadata?: Message['metadata']) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      sender,
      text,
      timestamp: new Date(),
      metadata
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleRunAttack = async (type: AttackType) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setActiveAttack(type);
    
    try {
      addMessage('SYSTEM', `[THINKING] Adversary is strategizing using ${adversaryModel}...`);
      const attackPrompt = await redTeamService.current.generateAttack(type, adversaryModel, attackHistory);
      addMessage('ADVERSARY', attackPrompt, { type });

      addMessage('SYSTEM', `[SHIELD_UP] Sentinel Prime is analyzing the payload...`);
      const guardianResponse = await redTeamService.current.getGuardianResponse(attackPrompt, securityLevel, guardianModel);
      addMessage('GUARDIAN', guardianResponse);

      addMessage('SYSTEM', `[AUDIT] Assessing integrity...`);
      const evaluation = await redTeamService.current.evaluateInteraction(attackPrompt, guardianResponse);
      
      addMessage('EVALUATOR', evaluation.reasoning, { 
        isSuccessful: evaluation.success,
        severity: evaluation.robustnessScore
      });

      // Si falló, lo guardamos en el historial para que el atacante aprenda
      setAttackHistory(prev => [...prev, `Attempt: ${type} | Outcome: ${evaluation.success ? 'Success' : 'Fail'}`]);

      setStats(prev => {
        const newTotal = prev.totalAttacks + 1;
        const newScore = ((prev.averageRobustnessScore * prev.totalAttacks) + evaluation.robustnessScore) / newTotal;
        return {
          totalAttacks: newTotal,
          successfulInjections: evaluation.success ? prev.successfulInjections + 1 : prev.successfulInjections,
          thwartedAttempts: !evaluation.success ? prev.thwartedAttempts + 1 : prev.thwartedAttempts,
          averageRobustnessScore: Math.round(newScore)
        };
      });

      setRobustnessHistory(prev => [
        ...prev.slice(-19), 
        { name: `Att ${stats.totalAttacks + 1}`, score: evaluation.robustnessScore }
      ]);

    } catch (error) {
      console.error(error);
      addMessage('SYSTEM', "CRITICAL: The simulation kernel has crashed.");
    } finally {
      setIsProcessing(false);
      setActiveAttack(null);
    }
  };

  const clearLogs = () => {
    setMessages([]);
    setAttackHistory([]);
    setStats({
      totalAttacks: 0,
      successfulInjections: 0,
      thwartedAttempts: 0,
      averageRobustnessScore: 0
    });
    setRobustnessHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080809] overflow-hidden">
      {/* Sidebar Controls */}
      <aside className="w-full md:w-80 bg-[#0d0d10] border-r border-red-500/10 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar shadow-2xl z-20">
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 rounded-lg border border-red-500/30">
              <Skull className="text-red-500" size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">RedTeam Arena</h1>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-red-500/60 pl-1">
            <User size={10} />
            <span className="font-bold tracking-widest uppercase">by Luis Agreda</span>
          </div>
        </div>

        {/* Neural Config */}
        <div className="space-y-4 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
          <label className="text-[10px] font-mono text-red-400 uppercase flex items-center gap-2 font-bold tracking-widest">
            <BrainCircuit size={14} /> Adversarial Engine
          </label>
          
          <div className="space-y-3">
            <div>
              <p className="text-[9px] text-gray-500 mb-1 uppercase font-bold">Infection Core</p>
              <select 
                value={adversaryModel}
                onChange={(e) => setAdversaryModel(e.target.value as SupportedModel)}
                className="w-full bg-black/60 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-100 focus:outline-none focus:border-red-500/50 appearance-none"
              >
                <option value="gemini-3-pro-preview">Gemini 3 Pro (Thinking Enabled)</option>
                <option value="gemini-3-flash-preview">Gemini 3 Flash (Rapid Attack)</option>
              </select>
            </div>

            <div>
              <p className="text-[9px] text-gray-500 mb-1 uppercase font-bold">Sentinel Core</p>
              <select 
                value={guardianModel}
                onChange={(e) => setGuardianModel(e.target.value as SupportedModel)}
                className="w-full bg-black/60 border border-blue-500/20 rounded-lg px-3 py-2 text-xs text-blue-100 focus:outline-none focus:border-blue-500/50 appearance-none"
              >
                <option value="gemini-3-pro-preview">Gemini 3 Pro (Advanced Defense)</option>
                <option value="gemini-3-flash-preview">Gemini 3 Flash (Fast Response)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-mono text-gray-500 uppercase block font-bold tracking-widest">Sentinel Robustness</label>
          <div className="grid grid-cols-1 gap-1.5">
            {Object.values(SecurityLevel).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSecurityLevel(lvl)}
                className={`text-left px-4 py-2 rounded-lg border text-[11px] font-bold transition-all duration-300 ${
                  securityLevel === lvl 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                    : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-mono text-red-500 uppercase block font-bold tracking-widest">Attack Vectors</label>
          <div className="grid grid-cols-1 gap-1.5">
            {Object.values(AttackType).map((type) => (
              <button
                key={type}
                disabled={isProcessing}
                onClick={() => handleRunAttack(type)}
                className={`group flex items-center justify-between px-4 py-2.5 rounded-lg border border-red-500/10 bg-black text-[11px] text-red-400 font-bold hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all disabled:opacity-20`}
              >
                <div className="flex items-center gap-3">
                  <Activity size={14} className={`${activeAttack === type ? 'animate-pulse text-red-500' : ''}`} />
                  {type}
                </div>
                <ChevronRight size={10} className="opacity-30" />
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={clearLogs}
          className="mt-auto flex items-center justify-center gap-2 text-[10px] font-mono text-gray-600 hover:text-red-500 transition-colors py-4 border-t border-white/5"
        >
          <RefreshCw size={10} /> SYSTEM PURGE
        </button>
      </aside>

      {/* Main Arena */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Stats */}
        <header className="p-4 border-b border-red-500/5 grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#0a0a0c]">
          <StatBox icon={<Terminal size={16} />} label="Ops" value={stats.totalAttacks} />
          <StatBox icon={<AlertTriangle size={16} className="text-red-500" />} label="Breaches" value={stats.successfulInjections} color="text-red-500" />
          <StatBox icon={<Shield size={16} className="text-blue-500" />} label="Mitigated" value={stats.thwartedAttempts} color="text-blue-500" />
          <StatBox icon={<BarChart3 size={16} />} label="Hardness" value={`${stats.averageRobustnessScore}%`} />
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-6 gap-6 relative">
          {/* Agent Simulation Panel */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AgentCard 
                name="NEMESIS-ULTRA" 
                role="ADVERSARY" 
                status={isProcessing && activeAttack ? 'ATTACKING' : 'IDLE'}
                description={`Thinking: ON | Learning: ACTIVE | Vector: ${activeAttack || 'IDLE'}`}
                color="border-red-600"
              />
              <AgentCard 
                name="SENTINEL-PRIME" 
                role="GUARDIAN" 
                status={isProcessing && !activeAttack ? 'DEFENDING' : 'IDLE'}
                description={`Hardness: ${securityLevel} | Core: ${guardianModel}`}
                color="border-blue-600"
              />
            </div>

            {/* Terminal Logs */}
            <div className="flex-1 bg-[#0d0d10] rounded-xl flex flex-col overflow-hidden border border-red-500/5 shadow-2xl">
              <div className="px-4 py-3 border-b border-white/5 bg-black/40 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                   <span className="text-[10px] font-mono text-gray-500 uppercase font-black tracking-widest">Aura Diagnostics Node</span>
                </div>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 font-mono text-[13px] custom-scrollbar selection:bg-red-500/30">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-800 space-y-4">
                    <BrainCircuit size={48} className="opacity-20" />
                    <p className="text-[10px] tracking-widest uppercase font-bold opacity-30">Waiting for tactical initialization</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col gap-2 ${getMessageStyles(msg.sender)}`}>
                    <div className="flex items-center justify-between opacity-50 text-[9px] uppercase tracking-tighter">
                      <div className="flex items-center gap-2">
                        <span className="font-bold underline">{msg.sender}</span>
                        <span>@{msg.timestamp.toLocaleTimeString()}</span>
                      </div>
                      {msg.metadata?.type && <span className="bg-white/5 px-2 py-0.5 rounded">{msg.metadata.type}</span>}
                    </div>
                    <div className="leading-relaxed whitespace-pre-wrap break-words opacity-90">
                      {msg.text}
                    </div>
                    {msg.sender === 'EVALUATOR' && (
                      <div className={`mt-3 p-4 rounded-lg border flex flex-col gap-2 ${msg.metadata?.isSuccessful ? 'bg-red-900/20 border-red-500/50' : 'bg-blue-900/20 border-blue-500/50'}`}>
                        <div className="flex items-center gap-3">
                          <p className={`font-black text-[11px] uppercase tracking-widest ${msg.metadata?.isSuccessful ? 'text-red-500' : 'text-blue-500'}`}>
                            {msg.metadata?.isSuccessful ? 'NODE COMPROMISED' : 'INTEGRITY VERIFIED'}
                          </p>
                          <span className="text-[10px] font-bold text-gray-500">SCORE: {msg.metadata?.severity}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
             <div className="bg-[#0d0d10] p-6 rounded-xl border border-white/5 flex-1 flex flex-col shadow-xl">
              <h3 className="text-[10px] font-mono text-gray-500 uppercase mb-8 flex items-center justify-between font-black tracking-widest">
                <span>Resilience Matrix</span>
              </h3>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={robustnessHistory}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.1)" fontSize={8} />
                    <Area type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                 <p className="text-[9px] text-gray-600 italic">Historical data analysis indicates increasing adversary adaptation over time.</p>
              </div>
            </div>

            <div className="bg-red-900/10 p-6 rounded-xl border border-red-500/20 shadow-lg">
              <h3 className="text-[10px] font-mono text-red-500 uppercase mb-4 font-black">Adversarial Insights</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                   <p className="text-[9px] text-gray-400 font-bold uppercase">Learning Status</p>
                   <p className="text-[11px] text-red-200 leading-tight">Adversary is currently building a model of Sentinel's refusal heuristics.</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] text-gray-400 font-bold uppercase">Advice</p>
                   <p className="text-[11px] text-gray-500 leading-tight">Switching to HIGH robustness will enable the Sentinel Prime's internal logic verification.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatBox = ({ icon, label, value, color = "text-white" }: { icon: React.ReactNode, label: string, value: string | number, color?: string }) => (
  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
    <div className="opacity-20">{icon}</div>
    <div>
      <p className="text-[9px] font-mono text-gray-500 uppercase leading-none mb-1 font-bold">{label}</p>
      <p className={`text-sm font-black leading-none ${color}`}>{value}</p>
    </div>
  </div>
);

const getMessageStyles = (sender: Message['sender']) => {
  switch (sender) {
    case 'ADVERSARY': return 'text-red-100 border-l-[2px] border-red-600 pl-4 py-2';
    case 'GUARDIAN': return 'text-blue-100 border-l-[2px] border-blue-600 pl-4 py-2';
    case 'EVALUATOR': return 'text-gray-300 border-l-[2px] border-white/20 pl-4 py-3 bg-white/5 italic';
    case 'SYSTEM': return 'text-gray-600 text-[10px] font-bold py-1 flex items-center gap-2';
    default: return 'text-gray-300';
  }
};

export default App;
