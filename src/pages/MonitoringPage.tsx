import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { FilterBar } from '../components/FilterBar';
import {
  Zap,
  Droplets,
  TrendingDown,
  TrendingUp,
  Activity,
  Gauge,
  Layers,
  ArrowUpRight,
  Info,
  Calendar,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { HOURLY_TELEMETRY, WEEKLY_TREND, MONTHLY_TREND } from '../data/mockCampusData';

export const MonitoringPage: React.FC = () => {
  const {
    buildings,
    selectedBuildingId,
    selectedResource,
    setSelectedResource,
    campusStats,
  } = useCampus();

  const [activeTab, setActiveTab] = useState<'electricity' | 'water'>(
    selectedResource === 'water' ? 'water' : 'electricity'
  );
  const [timeGranularity, setTimeGranularity] = useState<'hourly' | 'weekly' | 'monthly'>('hourly');

  const activeBuilding =
    selectedBuildingId === 'all'
      ? null
      : buildings.find(b => b.id === selectedBuildingId);

  // Compute Electricity statistics
  const currentElecKw = activeBuilding
    ? activeBuilding.currentPowerKw
    : campusStats.peakDemandKw;

  const todayElecKwh = activeBuilding
    ? activeBuilding.currentKwh
    : campusStats.totalElectricityToday;

  const weeklyElecKwh = Math.round(todayElecKwh * 6.8);
  const monthlyElecKwh = Math.round(todayElecKwh * 28.5);

  // Compute Water statistics
  const currentWaterLpm = activeBuilding
    ? activeBuilding.currentWaterFlowLpm
    : Math.round(buildings.reduce((a, b) => a + b.currentWaterFlowLpm, 0));

  const todayWaterL = activeBuilding
    ? activeBuilding.currentLiters
    : campusStats.totalWaterToday;

  const weeklyWaterL = Math.round(todayWaterL * 6.9);
  const monthlyWaterL = Math.round(todayWaterL * 29.2);

  // Submeter breakdown calculation
  const submeters = activeBuilding
    ? activeBuilding.submeters
    : { hvac: 38, labs: 28, lighting: 18, pumps: 10, general: 6 };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Real-time Resource Monitoring</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deep telemetric analysis for smart sub-meters, flow sensors, and baseline deviations.
          </p>
        </div>

        {/* Electricity vs Water Tab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          <button
            id="tab-electricity-btn"
            onClick={() => {
              setActiveTab('electricity');
              setSelectedResource('electricity');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'electricity'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Electricity (kWh)</span>
          </button>
          <button
            id="tab-water-btn"
            onClick={() => {
              setActiveTab('water');
              setSelectedResource('water');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'water'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>Water (Liters)</span>
          </button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <FilterBar />

      {/* 4 Core Summary Cards: Current, Today, Weekly, Monthly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Instantaneous Consumption */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Current Instantaneous
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                activeTab === 'electricity'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {activeTab === 'electricity' ? currentElecKw : currentWaterLpm}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {activeTab === 'electricity' ? 'kW Real-time' : 'L/min Flow'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {activeTab === 'electricity'
                ? `Power Factor: ${activeBuilding?.powerFactor || '0.93'}`
                : `Line Pressure: ${activeBuilding?.waterPressureBar || '3.1'} Bar`}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
            <span>Live telemetry pulse</span>
          </div>
        </div>

        {/* Card 2: Today's Consumption */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Today's Consumption
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                activeTab === 'electricity'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {activeTab === 'electricity'
                  ? todayElecKwh.toLocaleString()
                  : todayWaterL.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {activeTab === 'electricity' ? 'kWh' : 'Liters'}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-semibold text-rose-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>
                {activeTab === 'electricity' ? '+14.2% vs. baseline' : '+22.5% vs. baseline'}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Previous Day: </span>
            <span className="font-semibold text-slate-700">
              {activeTab === 'electricity'
                ? `${Math.round(todayElecKwh * 0.92)} kWh`
                : `${Math.round(todayWaterL * 0.84).toLocaleString()} L`}
            </span>
          </div>
        </div>

        {/* Card 3: Weekly Consumption */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Weekly Consumption
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                activeTab === 'electricity'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {activeTab === 'electricity'
                  ? weeklyElecKwh.toLocaleString()
                  : `${Math.round(weeklyWaterL / 1000).toLocaleString()} kL`}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {activeTab === 'electricity' ? 'kWh' : `(${weeklyWaterL.toLocaleString()} L)`}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <TrendingDown className="w-3 h-3" />
              <span>-3.8% vs. prior week</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Prior 7-day total: </span>
            <span className="font-semibold text-slate-700">
              {activeTab === 'electricity'
                ? `${Math.round(weeklyElecKwh * 1.04).toLocaleString()} kWh`
                : `${Math.round((weeklyWaterL * 1.05) / 1000)} kL`}
            </span>
          </div>
        </div>

        {/* Card 4: Monthly Consumption */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Monthly Consumption
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                activeTab === 'electricity'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {activeTab === 'electricity'
                  ? monthlyElecKwh.toLocaleString()
                  : `${Math.round(monthlyWaterL / 1000).toLocaleString()} kL`}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {activeTab === 'electricity' ? 'kWh' : 'kL'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Est. Bill: ~${activeTab === 'electricity' ? Math.round(monthlyElecKwh * 0.14) : Math.round(monthlyWaterL * 0.0032)}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Monthly budget pace: </span>
            <span className="font-bold text-amber-700">92% utilized</span>
          </div>
        </div>
      </div>

      {/* Usage Trend Chart with Granularity Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>{activeTab === 'electricity' ? '⚡ Electricity' : '💧 Water'} Usage Trend & Deviation Analysis</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison between actual metered consumption and target efficiency curve.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {(['hourly', 'weekly', 'monthly'] as const).map(gran => (
              <button
                key={gran}
                id={`granularity-${gran}-btn`}
                onClick={() => setTimeGranularity(gran)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors capitalize ${
                  timeGranularity === gran
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {gran}
              </button>
            ))}
          </div>
        </div>

        {/* Graph */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {timeGranularity === 'hourly' ? (
              <AreaChart data={HOURLY_TELEMETRY} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="resourceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={activeTab === 'electricity' ? '#f59e0b' : '#2563eb'}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={activeTab === 'electricity' ? '#f59e0b' : '#2563eb'}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  stroke="#cbd5e1"
                  unit={activeTab === 'electricity' ? ' kW' : ' L'}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey={activeTab === 'electricity' ? 'electricityActual' : 'waterActual'}
                  name={activeTab === 'electricity' ? 'Actual Load (kW)' : 'Actual Flow (L/hr)'}
                  stroke={activeTab === 'electricity' ? '#d97706' : '#2563eb'}
                  strokeWidth={2.5}
                  fill="url(#resourceGrad)"
                />
                <Area
                  type="monotone"
                  dataKey={activeTab === 'electricity' ? 'electricityBaseline' : 'waterBaseline'}
                  name={activeTab === 'electricity' ? 'Target Baseline (kW)' : 'Target Baseline (L/hr)'}
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="transparent"
                />
              </AreaChart>
            ) : (
              <BarChart
                data={timeGranularity === 'weekly' ? WEEKLY_TREND : MONTHLY_TREND}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar
                  dataKey={activeTab === 'electricity' ? 'electricityKwh' : 'waterLiters'}
                  name={activeTab === 'electricity' ? 'Total (kWh)' : 'Total (Liters)'}
                  fill={activeTab === 'electricity' ? '#f59e0b' : '#3b82f6'}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey={activeTab === 'electricity' ? 'wastageKwh' : 'wastageLiters'}
                  name={activeTab === 'electricity' ? 'Wastage (kWh)' : 'Wastage (Liters)'}
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sub-Meter Breakdown & Detailed Sensor Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submeter Allocation */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center space-x-2 mb-3">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Sub-Meter Allocation {activeBuilding ? `(${activeBuilding.name})` : '(Campus Aggregation)'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Estimated load distribution across electrical and hydraulic circuits.
          </p>

          <div className="space-y-3">
            {[
              { label: 'HVAC & Central Chillers', pct: submeters.hvac, color: 'bg-blue-600' },
              { label: 'Laboratories & Server Racks', pct: submeters.labs, color: 'bg-amber-500' },
              { label: 'Lighting & Smart Fixtures', pct: submeters.lighting, color: 'bg-emerald-500' },
              { label: 'Pumps & Hydraulic Loops', pct: submeters.pumps, color: 'bg-indigo-600' },
              { label: 'Auxiliary & General Sockets', pct: submeters.general, color: 'bg-slate-400' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>{item.label}</span>
                  <span className="font-bold text-slate-900">{item.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Building Telemetry Ranking for this Resource */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Building Telemetry for {activeTab === 'electricity' ? 'Electricity' : 'Water'}
              </h3>
            </div>
            <span className="text-xs text-slate-500">6 Blocks Monitored</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-2.5">Building</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Today Consumed</th>
                  <th className="pb-2.5">Baseline Target</th>
                  <th className="pb-2.5">Variance</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buildings.map(b => {
                  const consumed = activeTab === 'electricity' ? b.currentKwh : b.currentLiters;
                  const baseline = activeTab === 'electricity' ? b.normalAvgKwhDaily : b.normalAvgLitersDaily;
                  const variancePct = Math.round(((consumed - baseline) / baseline) * 100);
                  const isHighVariance = variancePct > 20;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 font-bold text-slate-900">
                        {b.name} <span className="text-slate-400 font-normal">({b.code})</span>
                      </td>
                      <td className="py-2.5 text-slate-600">{b.category}</td>
                      <td className="py-2.5 font-bold text-slate-800">
                        {consumed.toLocaleString()} {activeTab === 'electricity' ? 'kWh' : 'L'}
                      </td>
                      <td className="py-2.5 text-slate-500">
                        {baseline.toLocaleString()} {activeTab === 'electricity' ? 'kWh' : 'L'}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`font-semibold ${
                            variancePct > 0 ? (isHighVariance ? 'text-rose-600' : 'text-amber-600') : 'text-emerald-600'
                          }`}
                        >
                          {variancePct > 0 ? `+${variancePct}%` : `${variancePct}%`}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : b.status === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {b.status === 'critical' ? 'High Wastage' : b.status === 'warning' ? 'Auditing' : 'Optimal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
