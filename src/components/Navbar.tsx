import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  Zap,
  Droplets,
  Activity,
  AlertTriangle,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Radio,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  onOpenSimulateModal: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSimulateModal,
  currentPage,
  setCurrentPage,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const {
    user,
    signOut,
    campusStats,
    liveMonitoringActive,
    setLiveMonitoringActive,
    generateRecommendation,
  } = useCampus();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isGeneratingRec, setIsGeneratingRec] = useState(false);

  const handleGenerateRec = async () => {
    setIsGeneratingRec(true);
    try {
      await generateRecommendation();
    } finally {
      setIsGeneratingRec(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Campus Title */}
          <div className="flex items-center space-x-3">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => setCurrentPage('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-indigo-700 to-emerald-600 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
                <Zap className="w-5 h-5 text-amber-300 -mr-1" />
                <Droplets className="w-5 h-5 text-cyan-200" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">EcoCampus</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 rounded">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Smart Campus Energy & Water Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Center: Live Monitoring Indicator & Score Badge */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Live Monitoring Pill */}
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                liveMonitoringActive
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {liveMonitoringActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    liveMonitoringActive ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                ></span>
              </span>
              <span>{liveMonitoringActive ? 'Live Telemetry Active' : 'Telemetry Paused'}</span>
              <button
                id="toggle-live-monitoring-btn"
                onClick={() => setLiveMonitoringActive(!liveMonitoringActive)}
                className="ml-1 text-[11px] underline text-emerald-700 hover:text-emerald-900"
              >
                {liveMonitoringActive ? 'Pause' : 'Resume'}
              </button>
            </div>

            {/* Sustainability Score Widget */}
            <div
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-900 text-xs font-semibold cursor-pointer hover:bg-blue-100/70 transition-colors"
              onClick={() => setCurrentPage('analytics')}
              title="Campus Sustainability Score"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>Score:</span>
              <span className="text-blue-700 font-bold">{campusStats.sustainabilityScore}/100</span>
              <span className="px-1.5 py-0.2 bg-blue-200/80 text-blue-800 rounded text-[10px]">
                Grade {campusStats.scoreGrade}
              </span>
            </div>
          </div>

          {/* Right Action Controls: Hackathon Action Buttons & User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Simulate Anomaly Button */}
            <button
              id="navbar-simulate-anomaly-btn"
              onClick={onOpenSimulateModal}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              title="Trigger a simulated consumption event for hackathon demonstration"
            >
              <AlertTriangle className="w-4 h-4 text-amber-100" />
              <span className="hidden sm:inline">Simulate Anomaly</span>
              <span className="sm:hidden">Simulate</span>
            </button>

            {/* Generate AI Recommendation Button */}
            <button
              id="navbar-generate-rec-btn"
              onClick={handleGenerateRec}
              disabled={isGeneratingRec}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all disabled:opacity-70 cursor-pointer"
              title="Analyze live telemetry with AI to generate a targeted conservation recommendation"
            >
              <Sparkles className={`w-4 h-4 text-cyan-200 ${isGeneratingRec ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">
                {isGeneratingRec ? 'Analyzing...' : 'Generate AI Rec'}
              </span>
              <span className="md:hidden">AI Rec</span>
            </button>

            {/* User Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/30">
                    {user.displayName.charAt(0)}
                  </div>
                  <div className="text-left hidden lg:block pr-1">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {user.displayName}
                    </p>
                    <p className="text-[10px] text-slate-500">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{user.displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                        {user.role} {user.isDemoUser ? '• Demo Account' : '• Verified'}
                      </span>
                    </div>
                    <button
                      id="user-signout-btn"
                      onClick={() => {
                        signOut();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={() => setCurrentPage('login')}
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
