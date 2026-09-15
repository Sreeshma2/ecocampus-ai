import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Zap,
  Droplets,
  ArrowRight,
  Lock,
  Mail,
  UserCheck,
  Building2,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { user, login } = useCampus();

  const [email, setEmail] = useState('admin@ecocampus.edu');
  const [password, setPassword] = useState('smartcampus2026');
  const [role, setRole] = useState<'admin' | 'faculty' | 'student'>('admin');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(
        email,
        role === 'admin'
          ? 'Prof. Sarah Jenkins (Campus Facility Director)'
          : role === 'faculty'
          ? 'Dr. Robert Miller (Dept. Energy Lead)'
          : 'Alex Chen (Student Eco Council)',
        role
      );
      setIsLoading(false);
      onLoginSuccess();
    }, 400);
  };

  const handleDemoLogin = (demoRole: 'admin' | 'faculty' | 'student' = 'admin') => {
    setIsLoading(true);
    setTimeout(() => {
      login(
        'admin@ecocampus.edu',
        'Prof. Sarah Jenkins (Campus Facility Director)',
        demoRole
      );
      setIsLoading(false);
      onLoginSuccess();
    }, 300);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50/70">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 relative overflow-hidden">
          {/* Top Decorative Banner */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-tight">EcoCampus AI</h2>
                <span className="text-[11px] text-slate-500 font-medium">Smart Campus Utility Portal</span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Hackathon Prototype
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900">Sign in to Campus Console</h1>
            <p className="text-xs text-slate-500 mt-1">
              Monitor electricity, water telemetry, anomaly detection, and AI recommendations.
            </p>
          </div>

          {/* Quick 1-Click Demo Login Banner for Judges */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Hackathon Evaluators</span>
              </span>
              <span className="text-[10px] text-blue-700 font-semibold">1-Click Access</span>
            </div>
            <p className="text-xs text-blue-800 mb-3">
              Skip typing credentials to explore full simulated telemetry and Gemini 3.1 Pro Advisor:
            </p>
            <button
              id="demo-login-quick-btn"
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isLoading ? 'Accessing Campus...' : 'Instant Demo Login (Campus Admin)'}</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Or Sign In with College ID
            </span>
          </div>

          {/* Standard College Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="login-email">
                College Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-email"
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@ecocampus.edu"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Access Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['admin', 'faculty', 'student'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    id={`role-select-${r}`}
                    onClick={() => setRole(r)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      role === r
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="standard-login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer mt-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Micro Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              EcoCampus AI • Smart Campus Sustainability Hackathon 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
