import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, UserCheck, Zap, Sparkles } from 'lucide-react';

export default function QuickDemoLogin({ onLoggedIn }) {
  const { quickDemoLogin, loading } = useAuth();
  const [activeRole, setActiveRole] = React.useState(null);

  const handleQuickLogin = async (role) => {
    setActiveRole(role);
    const res = await quickDemoLogin(role);
    setActiveRole(null);
    if (res.success && onLoggedIn) {
      onLoggedIn();
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
      <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400">
        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <span className="uppercase tracking-wider">1-Click Instant Demo Access</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* HR Recruiter Demo Button */}
        <button
          type="button"
          onClick={() => handleQuickLogin('hr')}
          disabled={loading || activeRole !== null}
          className="flex items-center space-x-3 p-3 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-left transition group active:scale-98 disabled:opacity-50"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/30">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-indigo-300">
              {activeRole === 'hr' ? 'Logging in...' : 'HR Recruiter'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">hr@smarthire.ai</div>
          </div>
        </button>

        {/* Candidate Demo Button */}
        <button
          type="button"
          onClick={() => handleQuickLogin('candidate')}
          disabled={loading || activeRole !== null}
          className="flex items-center space-x-3 p-3 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-left transition group active:scale-98 disabled:opacity-50"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/30">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-purple-300">
              {activeRole === 'candidate' ? 'Logging in...' : 'Job Candidate'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">candidate@smarthire.ai</div>
          </div>
        </button>
      </div>
    </div>
  );
}
