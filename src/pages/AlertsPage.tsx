import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { FilterBar } from '../components/FilterBar';
import {
  BellRing,
  AlertTriangle,
  Zap,
  Droplets,
  CheckCircle2,
  Clock,
  Wrench,
  Sparkles,
  ArrowRight,
  Filter,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { SeverityLevel } from '../types';

interface AlertsPageProps {
  onOpenSimulateModal: () => void;
  onNavigateToAdvisor: () => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  onOpenSimulateModal,
  onNavigateToAdvisor,
}) => {
  const {
    alerts,
    resolveAlert,
    selectedBuildingId,
    selectedResource,
  } = useCampus();

  const [severityFilter, setSeverityFilter] = useState<'all' | SeverityLevel>('all');
  const [resolvedFilter, setResolvedFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [dispatchTicketAlertId, setDispatchTicketAlertId] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(a => {
    if (selectedBuildingId !== 'all' && a.buildingId !== selectedBuildingId) return false;
    if (selectedResource !== 'both' && a.resource !== selectedResource) return false;
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (resolvedFilter === 'active' && a.resolved) return false;
    if (resolvedFilter === 'resolved' && !a.resolved) return false;
    return true;
  });

  const activeCount = alerts.filter(a => !a.resolved).length;
  const criticalCount = alerts.filter(a => !a.resolved && a.severity === 'critical').length;

  const handleDispatchTicket = (alertId: string) => {
    setDispatchTicketAlertId(alertId);
    setTimeout(() => {
      setDispatchTicketAlertId(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Campus Incident & Alerts Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated alerts triggered when smart meters exceed deviation thresholds.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="alerts-simulate-modal-btn"
            onClick={onOpenSimulateModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Anomaly</span>
          </button>
        </div>
      </div>

      <FilterBar />

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Alerts Requiring Action
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-amber-600">{activeCount}</span>
            <span className="text-xs text-slate-500">Unresolved</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Facilities team standby status: Active</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Critical Severity Events
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-rose-600">{criticalCount}</span>
            <span className="text-xs text-slate-500">Immediate response</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">CSE cooling surge & Hostel 42 L/min leak</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Handled Today
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">
              {alerts.filter(a => a.resolved).length}
            </span>
            <span className="text-xs text-slate-500">Resolved incidents</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Restored campus baseline efficiency</p>
        </div>
      </div>

      {/* Alerts Center Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <BellRing className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">Active Incident Triage Stream</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
              {filteredAlerts.length} Alerts
            </span>
          </div>

          {/* Sub Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              {(['all', 'active', 'resolved'] as const).map(f => (
                <button
                  key={f}
                  id={`filter-alert-status-${f}-btn`}
                  onClick={() => setResolvedFilter(f)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors capitalize ${
                    resolvedFilter === f
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Severity Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map(sev => (
                <button
                  key={sev}
                  id={`filter-alert-severity-${sev}-btn`}
                  onClick={() => setSeverityFilter(sev as any)}
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
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3.5">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">No Alerts Found</p>
              <p className="text-xs text-slate-500 mt-1">
                All selected building meters are performing within baseline thresholds.
              </p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isCritical = alert.severity === 'critical';
              const isHigh = alert.severity === 'high';
              const isMedium = alert.severity === 'medium';

              return (
                <div
                  key={alert.id}
                  id={`alert-card-${alert.id}`}
                  className={`p-4 rounded-xl border transition-all ${
                    alert.resolved
                      ? 'bg-slate-50/70 border-slate-200 opacity-70'
                      : isCritical
                      ? 'bg-rose-50/20 border-rose-300 shadow-xs'
                      : isHigh
                      ? 'bg-amber-50/20 border-amber-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Severity Tag */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : isHigh
                              ? 'bg-amber-100 text-amber-800'
                              : isMedium
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {alert.severity} Severity
                        </span>

                        {/* Resource */}
                        <span className="flex items-center space-x-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {alert.resource === 'electricity' ? (
                            <Zap className="w-3 h-3 text-amber-500" />
                          ) : (
                            <Droplets className="w-3 h-3 text-blue-500" />
                          )}
                          <span className="capitalize">{alert.resource}</span>
                        </span>

                        <span className="text-xs font-bold text-slate-900">{alert.buildingName}</span>

                        <span className="flex items-center space-x-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{alert.time}</span>
                        </span>

                        {alert.excessPct && (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded">
                            +{alert.excessPct}% Spike
                          </span>
                        )}
                      </div>

                      {/* Title & Reason */}
                      <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                      <p className="text-xs text-slate-700">{alert.reason}</p>

                      {/* Recommended Action */}
                      <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100/80 text-xs text-blue-900 mt-2">
                        <span className="font-bold text-blue-800 flex items-center space-x-1 mb-0.5">
                          <Wrench className="w-3.5 h-3.5 text-blue-700" />
                          <span>Recommended Action:</span>
                        </span>
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          {alert.recommendedAction}
                        </p>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 self-start lg:self-center">
                      {!alert.resolved ? (
                        <>
                          <button
                            id={`resolve-alert-btn-${alert.id}`}
                            onClick={() => resolveAlert(alert.id)}
                            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark as Resolved</span>
                          </button>

                          <button
                            id={`dispatch-ticket-btn-${alert.id}`}
                            onClick={() => handleDispatchTicket(alert.id)}
                            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>
                              {dispatchTicketAlertId === alert.id ? 'Ticket Dispatched!' : 'Dispatch Maintenance'}
                            </span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center space-x-1 text-emerald-700 text-xs font-bold p-2 bg-emerald-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Incident Resolved</span>
                        </div>
                      )}

                      <button
                        id={`ask-ai-alert-btn-${alert.id}`}
                        onClick={onNavigateToAdvisor}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>Consult AI Advisor</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
