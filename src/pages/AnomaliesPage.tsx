import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { FilterBar } from '../components/FilterBar';
import {
  AlertOctagon,
  AlertTriangle,
  Zap,
  Droplets,
  CheckCircle2,
  Clock,
  Filter,
  DollarSign,
  TrendingUp,
  Cpu,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { SeverityLevel } from '../types';

interface AnomaliesPageProps {
  onOpenSimulateModal: () => void;
  onNavigateToAdvisor: () => void;
}

export const AnomaliesPage: React.FC<AnomaliesPageProps> = ({
  onOpenSimulateModal,
  onNavigateToAdvisor,
}) => {
  const {
    anomalies,
    resolveAnomaly,
    selectedBuildingId,
    selectedResource,
  } = useCampus();

  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'investigating' | 'resolved'>('all');

  // Filter anomalies based on building, resource, severity, and status
  const filteredAnomalies = anomalies.filter(a => {
    if (selectedBuildingId !== 'all' && a.buildingId !== selectedBuildingId) return false;
    if (selectedResource !== 'both' && a.resource !== selectedResource) return false;
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  const totalExcessElec = anomalies
    .filter(a => a.resource === 'electricity' && a.status !== 'resolved')
    .reduce((sum, a) => sum + a.excessValue, 0);

  const totalExcessWater = anomalies
    .filter(a => a.resource === 'water' && a.status !== 'resolved')
    .reduce((sum, a) => sum + a.excessValue, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Wastage & Anomaly Detection</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule-based detection flags after-hours power surges, night-time pipe leaks, and baseline deviations.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="anomalies-simulate-btn"
            onClick={onOpenSimulateModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Anomaly</span>
          </button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <FilterBar />

      {/* Detection Rules Engine Overview Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs">
        <div className="flex items-center space-x-2 mb-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Automated Rule-Based Anomaly Logic Active
          </h2>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          The engine continuously tests incoming 3-second meter packets against three campus heuristics:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-amber-400 font-bold text-xs">Rule 1: After-Hours Surge</span>
            <p className="text-[11px] text-slate-300 mt-1">
              Triggers when academic block electricity draw exceeds 25 kW between 7:00 PM and 6:00 AM.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-cyan-400 font-bold text-xs">Rule 2: Overnight Water Flow</span>
            <p className="text-[11px] text-slate-300 mt-1">
              Triggers when flow sustained &gt;25 L/min between 1:00 AM and 4:30 AM in residential wings.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-rose-400 font-bold text-xs">Rule 3: Baseline Divergence</span>
            <p className="text-[11px] text-slate-300 mt-1">
              Triggers when building consumption spikes &gt;20% over 14-day rolling diurnal average.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Impact Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Unresolved Anomalies
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {anomalies.filter(a => a.status === 'investigating').length}
          </p>
          <span className="text-[11px] text-slate-500">Requires facility triage</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Identified Electricity Wastage
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            +{totalExcessElec} <span className="text-xs font-semibold text-slate-500">kWh</span>
          </p>
          <span className="text-[11px] text-slate-500">~${Math.round(totalExcessElec * 0.14)} financial loss</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Identified Water Leakage
          </span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            +{totalExcessWater.toLocaleString()} <span className="text-xs font-semibold text-slate-500">Liters</span>
          </p>
          <span className="text-[11px] text-slate-500">~${Math.round(totalExcessWater * 0.0032)} financial loss</span>
        </div>
      </div>

      {/* Anomaly Table and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">Detected Anomalies Log</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
              {filteredAnomalies.length} Events
            </span>
          </div>

          {/* Sub-Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Severity Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              {(['all', 'high', 'medium', 'low'] as const).map(sev => (
                <button
                  key={sev}
                  id={`filter-severity-${sev}-btn`}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors capitalize ${
                    severityFilter === sev
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              {(['all', 'investigating', 'resolved'] as const).map(stat => (
                <button
                  key={stat}
                  id={`filter-status-${stat}-btn`}
                  onClick={() => setStatusFilter(stat)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors capitalize ${
                    statusFilter === stat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {stat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Anomaly Cards List */}
        <div className="space-y-3">
          {filteredAnomalies.map(anom => {
            const isResolved = anom.status === 'resolved';

            return (
              <div
                key={anom.id}
                id={`anomaly-item-${anom.id}`}
                className={`p-4 rounded-xl border transition-all ${
                  isResolved
                    ? 'bg-slate-50/60 border-slate-200 opacity-75'
                    : anom.severity === 'high'
                    ? 'bg-rose-50/20 border-rose-200 hover:border-rose-300'
                    : anom.severity === 'medium'
                    ? 'bg-amber-50/20 border-amber-200 hover:border-amber-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Severity Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          anom.severity === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : anom.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {anom.severity} Severity
                      </span>

                      {/* Resource Badge */}
                      <span className="flex items-center space-x-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {anom.resource === 'electricity' ? (
                          <Zap className="w-3 h-3 text-amber-500" />
                        ) : (
                          <Droplets className="w-3 h-3 text-blue-500" />
                        )}
                        <span className="capitalize">{anom.resource}</span>
                      </span>

                      {/* Building Name */}
                      <span className="text-xs font-bold text-slate-900">{anom.buildingName}</span>

                      {/* Detected time */}
                      <span className="flex items-center space-x-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{anom.detectedAt}</span>
                      </span>

                      {anom.simulated && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded">
                          Simulated
                        </span>
                      )}
                    </div>

                    {/* Reason */}
                    <p className="text-xs text-slate-700 font-medium">{anom.reason}</p>

                    {/* Excess & Financial loss */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>
                        Excess: <strong className="text-rose-600 font-bold">{anom.estimatedExcess}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Loss: <strong className="text-slate-800 font-semibold">{anom.financialLossEst}</strong>
                      </span>
                      <span>•</span>
                      <span className="capitalize">
                        Status:{' '}
                        <strong
                          className={
                            isResolved ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'
                          }
                        >
                          {anom.status}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
                    {!isResolved ? (
                      <button
                        id={`resolve-anomaly-${anom.id}-btn`}
                        onClick={() => resolveAnomaly(anom.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Resolved</span>
                      </span>
                    )}

                    <button
                      id={`advisor-remedy-${anom.id}-btn`}
                      onClick={onNavigateToAdvisor}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Ask AI Remedy</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
