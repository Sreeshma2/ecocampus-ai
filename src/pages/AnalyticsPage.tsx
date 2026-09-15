import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { FilterBar } from '../components/FilterBar';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  Zap,
  Droplets,
  AlertCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  HOURLY_TELEMETRY,
  WEEKLY_TREND,
  MONTHLY_TREND,
  PREDICTION_7_DAYS,
} from '../data/mockCampusData';

export const AnalyticsPage: React.FC = () => {
  const { campusStats } = useCampus();
  const [activeAnalysis, setActiveAnalysis] = useState<'daily' | 'weekly' | 'monthly' | 'correlation'>('daily');

  // Total forecast totals
  const totalForecastKwh = PREDICTION_7_DAYS.reduce((sum, d) => sum + d.predictedKwh, 0);
  const totalForecastWater = PREDICTION_7_DAYS.reduce((sum, d) => sum + d.predictedLiters, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Campus Analytics & Predictive Planning</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Temporal patterns, resource correlations, and transparent 7-day baseline forecasting.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          {[
            { id: 'daily', label: 'Daily (24h)' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'correlation', label: 'Elec vs Water' },
          ].map(tab => (
            <button
              key={tab.id}
              id={`analytics-tab-${tab.id}`}
              onClick={() => setActiveAnalysis(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeAnalysis === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <FilterBar />

      {/* Main Analytics Chart Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 capitalize">
              {activeAnalysis === 'daily'
                ? 'Daily Hourly Consumption Profile'
                : activeAnalysis === 'weekly'
                ? 'Weekly Day-by-Day Progression'
                : activeAnalysis === 'monthly'
                ? 'Monthly 4-Week Progression'
                : 'Electricity vs Water Correlation & Load Timing'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeAnalysis === 'correlation'
                ? 'Evaluates whether water replenishment pumping cycles synchronize with off-peak electricity tariffs.'
                : 'Comparing actual consumption curves against campus conservation goals.'}
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeAnalysis === 'daily' ? (
              <AreaChart data={HOURLY_TELEMETRY} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="anElecGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="anWaterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#d97706' }} stroke="#cbd5e1" unit=" kW" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#2563eb' }} stroke="#cbd5e1" unit=" L" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="electricityActual"
                  name="Electricity Load (kW)"
                  stroke="#d97706"
                  strokeWidth={2}
                  fill="url(#anElecGrad)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="waterActual"
                  name="Water Flow (L/hr)"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#anWaterGrad)"
                />
              </AreaChart>
            ) : activeAnalysis === 'weekly' ? (
              <BarChart data={WEEKLY_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#d97706' }} stroke="#cbd5e1" unit=" kWh" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#2563eb' }} stroke="#cbd5e1" unit=" L" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="electricityKwh" name="Electricity (kWh)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="waterLiters" name="Water (Liters)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : activeAnalysis === 'monthly' ? (
              <BarChart data={MONTHLY_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#d97706' }} stroke="#cbd5e1" unit=" kWh" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#2563eb' }} stroke="#cbd5e1" unit=" L" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="electricityKwh" name="Electricity (kWh)" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="waterLiters" name="Water (Liters)" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              // Electricity vs Water correlation
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
                  name="Electrical Demand (kW)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="waterActual"
                  name="Water Consumption (L/hr)"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transparent 7-Day Predictive Consumption Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Predicted Consumption for Next 7 Days
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Transparent Moving-Average Projection
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Based on historical 14-day rolling diurnal patterns, college timetable shifts, and ambient weather forecast.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-slate-500">7-Day Projected Power: </span>
              <strong className="text-amber-700 font-bold">{totalForecastKwh.toLocaleString()} kWh</strong>
            </div>
            <span>•</span>
            <div>
              <span className="text-slate-500">7-Day Projected Water: </span>
              <strong className="text-blue-700 font-bold">{Math.round(totalForecastWater / 1000)} kL</strong>
            </div>
          </div>
        </div>

        {/* Prediction Disclaimer Box */}
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Transparent Planning Disclaimer:</strong> This predictive section utilizes a transparent moving-average heuristic combined with the college academic calendar (e.g. lab schedules, weekend dorm occupancy shifts). It is designed to illustrate proactive campus utility scheduling and is not claimed as an absolute scientific forecast.
          </p>
        </div>

        {/* Predictive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {PREDICTION_7_DAYS.map((pred, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border transition-all ${
                pred.isWeekend
                  ? 'bg-slate-50/70 border-slate-200'
                  : 'bg-white border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{pred.day}</h4>
                  <span className="text-[10px] text-slate-500">{pred.date}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pred.isWeekend ? 'bg-slate-200 text-slate-700' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {pred.isWeekend ? 'Weekend Low Load' : 'Full Timetable'}
                </span>
              </div>

              {/* Forecast Numbers */}
              <div className="space-y-1.5 my-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center space-x-1 text-slate-600">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>Electricity</span>
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {pred.predictedKwh} <span className="font-normal text-slate-500 text-[10px]">kWh</span>
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  Range: {pred.lowerKwh} - {pred.upperKwh} kWh
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="flex items-center space-x-1 text-slate-600">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span>Water</span>
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {pred.predictedLiters.toLocaleString()}{' '}
                    <span className="font-normal text-slate-500 text-[10px]">L</span>
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  Range: {pred.lowerLiters.toLocaleString()} - {pred.upperLiters.toLocaleString()} L
                </div>
              </div>

              {/* Factor Note */}
              <p className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100 line-clamp-3">
                <span className="font-semibold text-slate-700">Driver:</span> {pred.factorNote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
