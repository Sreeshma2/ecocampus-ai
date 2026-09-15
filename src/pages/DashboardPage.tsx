import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { FilterBar } from '../components/FilterBar';
import {
  Zap,
  Droplets,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles,
  Building2,
  Clock,
  CheckCircle2,
  Flame,
  Gauge,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { HOURLY_TELEMETRY } from '../data/mockCampusData';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onOpenSimulateModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenSimulateModal,
}) => {
  const {
    campusStats,
    buildings,
    selectedBuildingId,
    selectedResource,
    selectedTimePeriod,
    alerts,
    anomalies,
    recommendations,
    liveMonitoringActive,
    generateRecommendation,
  } = useCampus();

  const [chartView, setChartView] = useState<'both' | 'electricity' | 'water'>('both');
  const [isGeneratingRec, setIsGeneratingRec] = useState(false);

  // Filter building data if a specific building is selected
  const activeBuilding =
    selectedBuildingId === 'all'
      ? null
      : buildings.find(b => b.id === selectedBuildingId);

  // Scaled stats based on building selection
  const displayElectricityToday = activeBuilding
    ? activeBuilding.currentKwh
    : campusStats.totalElectricityToday;

  const displayWaterToday = activeBuilding
    ? activeBuilding.currentLiters
    : campusStats.totalWaterToday;

  const displayWastageElec = activeBuilding
    ? activeBuilding.wastageKwh
    : campusStats.estimatedWastageKwh;

  const displayWastageWater = activeBuilding
    ? activeBuilding.wastageLiters
    : campusStats.estimatedWastageLiters;

  const displayScore = activeBuilding
    ? activeBuilding.sustainabilityScore
    : campusStats.sustainabilityScore;

  const activeAlerts = alerts.filter(
    a => !a.resolved && (selectedBuildingId === 'all' || a.buildingId === selectedBuildingId)
  );

  const handleQuickRec = async () => {
    setIsGeneratingRec(true);
    try {
      await generateRecommendation();
    } finally {
      setIsGeneratingRec(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Campus Sustainability & Consumption Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time IoT smart meter telemetry, rule-based anomaly detection, and AI optimization.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            id="dashboard-simulate-anomaly-btn"
            onClick={onOpenSimulateModal}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Anomaly</span>
          </button>
          <button
            id="dashboard-generate-ai-rec-btn"
            onClick={handleQuickRec}
            disabled={isGeneratingRec}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-70 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingRec ? 'animate-spin' : ''}`} />
            <span>{isGeneratingRec ? 'Analyzing...' : 'Generate AI Rec'}</span>
          </button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <FilterBar />

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Electricity Today */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Electricity Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-amber-500/20" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {displayElectricityToday.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500">kWh</span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-semibold text-rose-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+14.8% vs. 30-day baseline</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Instantaneous draw</span>
            <span className="font-bold text-slate-800">
              {activeBuilding ? `${activeBuilding.currentPowerKw} kW` : `${campusStats.peakDemandKw} kW`}
            </span>
          </div>
        </div>

        {/* Card 2: Total Water Today */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Water Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplets className="w-4 h-4 fill-blue-500/20" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {displayWaterToday.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500">Liters</span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-semibold text-rose-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+22.4% (Leak Detected)</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Current campus flow</span>
            <span className="font-bold text-slate-800">
              {activeBuilding
                ? `${activeBuilding.currentWaterFlowLpm} L/min`
                : `${Math.round(buildings.reduce((a, b) => a + b.currentWaterFlowLpm, 0))} L/min`}
            </span>
          </div>
        </div>

        {/* Card 3: Estimated Wastage */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Estimated Wastage
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-rose-600 tracking-tight">
                ~${activeBuilding ? Math.round(displayWastageElec * 0.14 + displayWastageWater * 0.0032) : campusStats.estimatedCostWasted}
              </span>
              <span className="text-xs font-medium text-slate-500">/ day</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span>{displayWastageElec} kWh</span> • <span>{displayWastageWater.toLocaleString()} L</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Avoidable Carbon</span>
            <span className="font-bold text-emerald-700">
              {Math.round(displayWastageElec * 0.82)} kg CO2e
            </span>
          </div>
        </div>

        {/* Card 4: Active Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Alerts
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-amber-600 tracking-tight">
                {activeAlerts.length}
              </span>
              <span className="text-xs font-medium text-slate-500">incidents active</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-1 truncate">
              {activeAlerts[0]?.title || 'All systems normal'}
            </div>
          </div>
          <button
            id="jump-to-alerts-btn"
            onClick={() => onNavigate('alerts')}
            className="pt-2 border-t border-slate-100 w-full flex items-center justify-between text-[11px] font-semibold text-blue-600 hover:text-blue-800"
          >
            <span>Review triage queue</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 5: Campus Sustainability Score */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Sustainability Score
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-emerald-700 tracking-tight">
                {displayScore}
              </span>
              <span className="text-xs font-bold text-emerald-800">/ 100</span>
              <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md">
                Grade {campusStats.scoreGrade}
              </span>
            </div>
            {/* Score progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 to-teal-600"
                style={{ width: `${displayScore}%` }}
              />
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Target: 85+</span>
            <span className="font-semibold text-slate-700">Need 7 actions</span>
          </div>
        </div>
      </div>

      {/* Real-time Incident Callout if Critical Alert Exists */}
      {activeAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                  Anomaly Detected
                </span>
                <span className="text-xs font-bold text-slate-900">{activeAlerts[0].title}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{activeAlerts[0].reason}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
            <button
              id="view-alert-details-btn"
              onClick={() => onNavigate('alerts')}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs"
            >
              Take Action
            </button>
          </div>
        </div>
      )}

      {/* Main 24-Hour Telemetry Graph Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">
                24-Hour Campus Consumption & Baseline Curve
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                Hourly Actual vs Expected Model
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Highlighting night-time leakage anomalies and after-hours electricity surges.
            </p>
          </div>

          {/* Graph Toggle */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
            <button
              id="chart-view-both-btn"
              onClick={() => setChartView('both')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                chartView === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Combined
            </button>
            <button
              id="chart-view-elec-btn"
              onClick={() => setChartView('electricity')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 ${
                chartView === 'electricity' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Electricity</span>
            </button>
            <button
              id="chart-view-water-btn"
              onClick={() => setChartView('water')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 ${
                chartView === 'water' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Droplets className="w-3 h-3 text-blue-500" />
              <span>Water</span>
            </button>
          </div>
        </div>

        {/* Recharts Graph Container */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'electricity' ? (
              <AreaChart data={HOURLY_TELEMETRY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="elecActualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" unit=" kW" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="electricityActual"
                  name="Actual Electricity (kW)"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fill="url(#elecActualGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="electricityBaseline"
                  name="Expected Baseline (kW)"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </AreaChart>
            ) : chartView === 'water' ? (
              <AreaChart data={HOURLY_TELEMETRY} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="waterActualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" unit=" L" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="waterActual"
                  name="Actual Water (Liters/hr)"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#waterActualGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="waterBaseline"
                  name="Expected Baseline (Liters/hr)"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </AreaChart>
            ) : (
              // Combined Dual Axis Chart
              <LineChart data={HOURLY_TELEMETRY} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#d97706' }} stroke="#cbd5e1" unit=" kW" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#2563eb' }} stroke="#cbd5e1" unit=" L" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="electricityActual"
                  name="Electricity Actual (kW)"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="electricityBaseline"
                  name="Electricity Baseline"
                  stroke="#fcd34d"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="waterActual"
                  name="Water Actual (L/hr)"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="waterBaseline"
                  name="Water Baseline"
                  stroke="#93c5fd"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Buildings Live Telemetry Status Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Live Campus Blocks Telemetry</h2>
            <p className="text-xs text-slate-500">Real-time smart sub-meter readings updating every 3s</p>
          </div>
          <button
            id="view-all-buildings-btn"
            onClick={() => onNavigate('buildings')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>Compare all blocks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.map(building => {
            const isWarning = building.status === 'warning';
            const isCritical = building.status === 'critical';

            return (
              <div
                key={building.id}
                id={`building-card-${building.id}`}
                className={`p-4 rounded-xl border transition-all ${
                  isCritical
                    ? 'border-rose-300 bg-rose-50/30'
                    : isWarning
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-slate-900">{building.name}</h3>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {building.code}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">{building.category}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isCritical ? 'Critical Leak/Spike' : isWarning ? 'Warning' : 'Normal'}
                  </span>
                </div>

                {/* Telemetry Numbers */}
                <div className="grid grid-cols-2 gap-2 my-3">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center space-x-1 text-[10px] font-semibold text-slate-500">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>Power (kW)</span>
                    </div>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">
                      {building.currentPowerKw} <span className="text-xs font-normal text-slate-500">kW</span>
                    </p>
                    <p className="text-[10px] text-slate-500">Today: {building.currentKwh} kWh</p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center space-x-1 text-[10px] font-semibold text-slate-500">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      <span>Flow Rate</span>
                    </div>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">
                      {building.currentWaterFlowLpm} <span className="text-xs font-normal text-slate-500">L/m</span>
                    </p>
                    <p className="text-[10px] text-slate-500">Today: {building.currentLiters.toLocaleString()} L</p>
                  </div>
                </div>

                {/* Primary Issue Highlight */}
                {building.primaryIssue && (
                  <p className="text-[11px] text-slate-600 line-clamp-2 bg-white/80 p-1.5 rounded border border-slate-100">
                    <span className="font-semibold text-slate-800">Issue:</span> {building.primaryIssue}
                  </p>
                )}

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Sustainability Score:</span>
                  <span
                    className={`font-bold ${
                      building.sustainabilityScore >= 80
                        ? 'text-emerald-700'
                        : building.sustainabilityScore >= 70
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {building.sustainabilityScore}/100
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
