import React from 'react';
import { useCampus } from '../context/CampusContext';
import {
  LayoutDashboard,
  Gauge,
  AlertOctagon,
  BarChart3,
  Building2,
  BellRing,
  BotMessageSquare,
  Sparkles,
  Zap,
  Droplets,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setCurrentPage,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { anomalies, alerts, campusStats } = useCampus();

  const activeAlertsCount = alerts.filter(a => !a.resolved).length;
  const activeAnomaliesCount = anomalies.filter(a => a.status === 'investigating').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      description: 'Campus overview & telemetry',
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: Gauge,
      badge: null,
      description: 'Electricity & Water meters',
    },
    {
      id: 'anomalies',
      label: 'Anomalies',
      icon: AlertOctagon,
      badge: activeAnomaliesCount > 0 ? activeAnomaliesCount : null,
      badgeColor: 'bg-rose-100 text-rose-700',
      description: 'Detection & wastage tracking',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
      description: 'Trends & 7-day forecast',
    },
    {
      id: 'buildings',
      label: 'Buildings',
      icon: Building2,
      badge: '6 Blocks',
      badgeColor: 'bg-slate-100 text-slate-600',
      description: 'Comparison & benchmarks',
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: BellRing,
      badge: activeAlertsCount > 0 ? activeAlertsCount : null,
      badgeColor: 'bg-amber-100 text-amber-800',
      description: 'Incident response hub',
    },
    {
      id: 'advisor',
      label: 'AI Advisor',
      icon: BotMessageSquare,
      badge: 'Gemini 3.1',
      badgeColor: 'bg-indigo-100 text-indigo-700 font-semibold',
      description: 'EcoBot & recommendations',
    },
  ];

  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 z-40 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Section: Navigation */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Campus Operations
            </p>
            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-blue-600'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== null && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Telemetry Glance Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Grid & Water Status
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            {/* Electricity Load bar */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span className="flex items-center space-x-1 text-slate-600">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Substation Load</span>
                </span>
                <span className="font-bold text-slate-900">
                  {campusStats.peakDemandKw} / {campusStats.peakCapacityKw} kW
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (campusStats.peakDemandKw / campusStats.peakCapacityKw) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Water reserve bar */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span className="flex items-center space-x-1 text-slate-600">
                  <Droplets className="w-3 h-3 text-blue-500" />
                  <span>Overhead Storage</span>
                </span>
                <span className="font-bold text-slate-900">76% (120 kL)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: '76%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer info: Hackathon prototype note */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Smart Campus Hackathon Demo Prototype</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-normal">
            Simulated IoT edge telemetry • Rule-based anomalies • Gemini 3.1 Pro Advisor
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-1.5 px-2 flex justify-around items-center shadow-lg">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'monitoring', label: 'Monitor', icon: Gauge },
          { id: 'anomalies', label: 'Anomalies', icon: AlertOctagon },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'buildings', label: 'Blocks', icon: Building2 },
          { id: 'alerts', label: 'Alerts', icon: BellRing },
          { id: 'advisor', label: 'AI Advisor', icon: BotMessageSquare },
        ].map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
