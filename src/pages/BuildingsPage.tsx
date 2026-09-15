import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  Building2,
  Trophy,
  Zap,
  Droplets,
  Flame,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Users,
  Maximize2,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const BuildingsPage: React.FC = () => {
  const { buildings } = useCampus();

  const [compareMetric, setCompareMetric] = useState<'electricity' | 'water' | 'wastage'>('electricity');
  const [buildingAId, setBuildingAId] = useState<string>('cse-block');
  const [buildingBId, setBuildingBId] = useState<string>('hostel-block');

  // Sorted list for rankings
  const sortedBuildings = [...buildings].sort((a, b) => {
    if (compareMetric === 'electricity') {
      return b.currentKwh - a.currentKwh; // descending consumption
    }
    if (compareMetric === 'water') {
      return b.currentLiters - a.currentLiters;
    }
    return (b.wastageKwh * 0.14 + b.wastageLiters * 0.0032) - (a.wastageKwh * 0.14 + a.wastageLiters * 0.0032);
  });

  // Chart data
  const chartData = buildings.map(b => ({
    name: b.name.replace(' Block', '').replace('Central ', ''),
    fullName: b.name,
    electricity: b.currentKwh,
    baselineElec: b.normalAvgKwhDaily,
    water: b.currentLiters,
    baselineWater: b.normalAvgLitersDaily,
    wastageCost: Math.round(b.wastageKwh * 0.14 + b.wastageLiters * 0.0032),
    score: b.sustainabilityScore,
  }));

  const buildingA = buildings.find(b => b.id === buildingAId) || buildings[0];
  const buildingB = buildings.find(b => b.id === buildingBId) || buildings[1];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Building & Department Comparison</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-departmental resource intensity benchmarks, wastage rankings, and side-by-side audits.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          <button
            id="compare-metric-elec-btn"
            onClick={() => setCompareMetric('electricity')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              compareMetric === 'electricity'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>By Electricity</span>
          </button>
          <button
            id="compare-metric-water-btn"
            onClick={() => setCompareMetric('water')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              compareMetric === 'water'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>By Water</span>
          </button>
          <button
            id="compare-metric-waste-btn"
            onClick={() => setCompareMetric('wastage')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              compareMetric === 'wastage'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>By Wastage ($)</span>
          </button>
        </div>
      </div>

      {/* Comparative Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Campus Blocks Comparison: {compareMetric.toUpperCase()}
            </h2>
            <p className="text-xs text-slate-500">
              Comparing all 6 campus blocks to identify high consumption footprints.
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {compareMetric === 'electricity' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" unit=" kWh" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="electricity" name="Actual Consumption (kWh)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="baselineElec" name="Baseline Normal (kWh)" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : compareMetric === 'water' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" unit=" L" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="water" name="Actual Water (Liters)" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="baselineWater" name="Baseline Normal (Liters)" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" unit=" $" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="wastageCost" name="Daily Estimated Wastage Loss ($)" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Rankings Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900">
            Campus Department Rankings & Efficiency Index
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 text-center w-12">Rank</th>
                <th className="pb-3">Building / Block</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Occupancy</th>
                <th className="pb-3">Electricity</th>
                <th className="pb-3">Water</th>
                <th className="pb-3">Avoidable Wastage</th>
                <th className="pb-3 text-center">Sustainability</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedBuildings.map((b, index) => {
                const isChampion = index === 0;
                const wastageDollar = Math.round(b.wastageKwh * 0.14 + b.wastageLiters * 0.0032);

                return (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 text-center font-black text-slate-800">
                      {index + 1}
                    </td>
                    <td className="py-3">
                      <div className="font-bold text-slate-900">{b.name}</div>
                      <div className="text-[10px] text-slate-400">{b.code} • {b.sqFt.toLocaleString()} sq.ft</div>
                    </td>
                    <td className="py-3 text-slate-600">{b.category}</td>
                    <td className="py-3 text-slate-600">{b.occupancy} members</td>
                    <td className="py-3 font-semibold text-slate-900">
                      {b.currentKwh} <span className="text-slate-400 text-[10px]">kWh</span>
                    </td>
                    <td className="py-3 font-semibold text-slate-900">
                      {b.currentLiters.toLocaleString()} <span className="text-slate-400 text-[10px]">L</span>
                    </td>
                    <td className="py-3 font-bold text-rose-600">
                      ~${wastageDollar}/day
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                          b.sustainabilityScore >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.sustainabilityScore >= 70
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.sustainabilityScore}/100
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          b.status === 'critical'
                            ? 'bg-rose-100 text-rose-700'
                            : b.status === 'warning'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {b.status === 'critical' ? 'Urgent Audit' : b.status === 'warning' ? 'Watch' : 'Optimal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side 1-on-1 Block Comparison Tool */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center space-x-2 mb-4">
          <Scale className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">
            Side-by-Side Block Comparison Tool
          </h2>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <label htmlFor="compare-building-a-select" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Select Primary Building (A)
            </label>
            <select
              id="compare-building-a-select"
              value={buildingAId}
              onChange={e => setBuildingAId(e.target.value)}
              className="w-full text-xs font-bold border-0 bg-transparent text-slate-900 p-0 focus:ring-0 cursor-pointer"
            >
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <label htmlFor="compare-building-b-select" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Select Benchmark Building (B)
            </label>
            <select
              id="compare-building-b-select"
              value={buildingBId}
              onChange={e => setBuildingBId(e.target.value)}
              className="w-full text-xs font-bold border-0 bg-transparent text-slate-900 p-0 focus:ring-0 cursor-pointer"
            >
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Direct Side-by-Side Specs Grid */}
        <div className="grid grid-cols-3 gap-2 text-xs border border-slate-100 rounded-xl overflow-hidden">
          <div className="bg-slate-100/70 p-3 font-bold text-slate-600">Metric</div>
          <div className="bg-blue-50/50 p-3 font-bold text-blue-900">{buildingA.name}</div>
          <div className="bg-indigo-50/50 p-3 font-bold text-indigo-900">{buildingB.name}</div>

          <div className="p-3 border-t border-slate-100 text-slate-600">Floor Area</div>
          <div className="p-3 border-t border-slate-100 font-semibold">{buildingA.sqFt.toLocaleString()} sq.ft</div>
          <div className="p-3 border-t border-slate-100 font-semibold">{buildingB.sqFt.toLocaleString()} sq.ft</div>

          <div className="p-3 border-t border-slate-100 text-slate-600">Occupancy</div>
          <div className="p-3 border-t border-slate-100 font-semibold">{buildingA.occupancy} members</div>
          <div className="p-3 border-t border-slate-100 font-semibold">{buildingB.occupancy} members</div>

          <div className="p-3 border-t border-slate-100 text-slate-600">Daily Electricity</div>
          <div className="p-3 border-t border-slate-100 font-bold text-amber-700">{buildingA.currentKwh} kWh</div>
          <div className="p-3 border-t border-slate-100 font-bold text-amber-700">{buildingB.currentKwh} kWh</div>

          <div className="p-3 border-t border-slate-100 text-slate-600">Daily Water</div>
          <div className="p-3 border-t border-slate-100 font-bold text-blue-700">{buildingA.currentLiters.toLocaleString()} L</div>
          <div className="p-3 border-t border-slate-100 font-bold text-blue-700">{buildingB.currentLiters.toLocaleString()} L</div>

          <div className="p-3 border-t border-slate-100 text-slate-600">Energy Intensity</div>
          <div className="p-3 border-t border-slate-100 font-medium">
            {(buildingA.currentKwh / buildingA.sqFt).toFixed(3)} kWh/sq.ft
          </div>
          <div className="p-3 border-t border-slate-100 font-medium">
            {(buildingB.currentKwh / buildingB.sqFt).toFixed(3)} kWh/sq.ft
          </div>

          <div className="p-3 border-t border-slate-100 text-slate-600">Water Intensity</div>
          <div className="p-3 border-t border-slate-100 font-medium">
            {(buildingA.currentLiters / buildingA.occupancy).toFixed(1)} L/occupant
          </div>
          <div className="p-3 border-t border-slate-100 font-medium">
            {(buildingB.currentLiters / buildingB.occupancy).toFixed(1)} L/occupant
          </div>

          <div className="p-3 border-t border-slate-100 text-slate-600">Sustainability Score</div>
          <div className="p-3 border-t border-slate-100 font-black text-emerald-700">{buildingA.sustainabilityScore}/100</div>
          <div className="p-3 border-t border-slate-100 font-black text-emerald-700">{buildingB.sustainabilityScore}/100</div>
        </div>
      </div>
    </div>
  );
};
