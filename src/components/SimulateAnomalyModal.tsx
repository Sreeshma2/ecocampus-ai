import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { X, AlertTriangle, Zap, Droplets, Sparkles, CheckCircle2 } from 'lucide-react';

interface SimulateAnomalyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAlerts?: () => void;
}

export const SimulateAnomalyModal: React.FC<SimulateAnomalyModalProps> = ({
  isOpen,
  onClose,
  onNavigateToAlerts,
}) => {
  const { buildings, simulateAnomaly } = useCampus();

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('cse-block');
  const [resource, setResource] = useState<'electricity' | 'water'>('electricity');
  const [severity, setSeverity] = useState<'critical' | 'high' | 'medium'>('high');
  const [customTitle, setCustomTitle] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [excessAmount, setExcessAmount] = useState<number>(180);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const presets = [
    {
      title: 'CSE Server Lab HVAC Inefficiency Surge',
      buildingId: 'cse-block',
      resource: 'electricity' as const,
      excessValue: 220,
      excessPct: 35,
      unit: 'kWh',
      reason: 'Overnight research cluster chiller locked at 18°C setpoint; consumption rose 35% above expected baseline.',
      action: 'Set research thermostat to 24°C and enable idle sleep states on compute racks.',
    },
    {
      title: 'Hostel Wing C Overhead Tank Valve Failure',
      buildingId: 'hostel-block',
      resource: 'water' as const,
      excessValue: 9200,
      excessPct: 42,
      unit: 'Liters',
      reason: 'Continuous 45 L/min flow between 1 AM and 4 AM triggered by failed shutoff float sensor.',
      action: 'Dispatch facilities plumber to replace tank shutoff float and inspect riser valve.',
    },
    {
      title: 'Mechanical Workshop Compressor Idle Draw',
      buildingId: 'mech-block',
      resource: 'electricity' as const,
      excessValue: 140,
      excessPct: 24,
      unit: 'kWh',
      reason: 'High-pressure air compressor left energized in unload mode during lunchtime recess.',
      action: 'Install automatic 15-minute idle cutoff contactor on main pneumatic circuit.',
    },
    {
      title: 'Admin Block Chiller Schedule Pre-start',
      buildingId: 'admin-block',
      resource: 'electricity' as const,
      excessValue: 85,
      excessPct: 20,
      unit: 'kWh',
      reason: 'HVAC initiated 3 hours before building opening on mild morning.',
      action: 'Recalibrate BMS occupancy schedule to 7:45 AM start.',
    },
  ];

  const handleApplyPreset = (preset: (typeof presets)[0]) => {
    simulateAnomaly({
      buildingId: preset.buildingId,
      resource: preset.resource,
      title: preset.title,
      reason: preset.reason,
      excessValue: preset.excessValue,
      unit: preset.unit,
      excessPct: preset.excessPct,
      recommendedAction: preset.action,
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      if (onNavigateToAlerts) onNavigateToAlerts();
    }, 1200);
  };

  const handleTriggerCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBuilding = buildings.find(b => b.id === selectedBuildingId) || buildings[0];
    const unit = resource === 'electricity' ? 'kWh' : 'Liters';

    simulateAnomaly({
      buildingId: targetBuilding.id,
      resource,
      title: customTitle || `${targetBuilding.name} Unscheduled ${resource === 'electricity' ? 'Energy Surge' : 'Water Loss'}`,
      reason: customReason || `Abnormal ${resource} consumption spike detected by automated campus telemetry monitor.`,
      excessValue: excessAmount,
      unit,
      excessPct: Math.round((excessAmount / (resource === 'electricity' ? 600 : 8000)) * 100),
      recommendedAction: `Inspect ${targetBuilding.name} sub-meters and dispatch audit technician to verify fixtures.`,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      if (onNavigateToAlerts) onNavigateToAlerts();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 relative">
        <button
          id="close-simulate-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Simulate Consumption Anomaly</h2>
            <p className="text-xs text-slate-500">
              Hackathon Demonstration Tool: Inject real-time wastage events
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Anomaly Injected Successfully!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Live telemetry updated, campus score adjusted, and real-time alert created on the dashboard.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {/* Quick 1-Click Presets */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Hackathon Scenarios (1-Click)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    id={`simulate-preset-btn-${idx}`}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3 text-left rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-amber-900 mb-1">
                      <span className="truncate">{preset.title}</span>
                      {preset.resource === 'electricity' ? (
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      <span>+{preset.excessPct}% Spike</span>
                      <span>•</span>
                      <span className="text-amber-700 font-semibold">
                        +{preset.excessValue.toLocaleString()} {preset.unit}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Anomaly Builder */}
            <form onSubmit={handleTriggerCustom} className="border-t border-slate-200/80 pt-4 space-y-3.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Or Configure Custom Event
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Building */}
                <div>
                  <label htmlFor="custom-building-select" className="block text-[11px] font-bold text-slate-600 mb-1">Target Building</label>
                  <select
                    id="custom-building-select"
                    value={selectedBuildingId}
                    onChange={e => setSelectedBuildingId(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    {buildings.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resource */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Resource</label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      id="custom-resource-electricity-btn"
                      onClick={() => {
                        setResource('electricity');
                        setExcessAmount(180);
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 border ${
                        resource === 'electricity'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Electricity</span>
                    </button>
                    <button
                      type="button"
                      id="custom-resource-water-btn"
                      onClick={() => {
                        setResource('water');
                        setExcessAmount(6500);
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 border ${
                        resource === 'water'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Droplets className="w-3.5 h-3.5" />
                      <span>Water</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Excess Amount */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Simulated Excess Volume</span>
                  <span className="text-amber-700 font-bold">
                    +{excessAmount.toLocaleString()} {resource === 'electricity' ? 'kWh' : 'Liters'}
                  </span>
                </div>
                <input
                  id="excess-amount-range"
                  type="range"
                  min={resource === 'electricity' ? 30 : 500}
                  max={resource === 'electricity' ? 500 : 25000}
                  step={resource === 'electricity' ? 10 : 500}
                  value={excessAmount}
                  onChange={e => setExcessAmount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Title & Reason */}
              <div>
                <label htmlFor="custom-event-title-input" className="block text-[11px] font-bold text-slate-600 mb-1">Event Title</label>
                <input
                  id="custom-event-title-input"
                  type="text"
                  placeholder="e.g. Unscheduled Cooling Loop Runaway"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  id="cancel-simulate-modal-btn"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="inject-anomaly-submit-btn"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                >
                  Inject Simulated Event
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
