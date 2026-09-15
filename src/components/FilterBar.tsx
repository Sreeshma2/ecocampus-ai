import React from 'react';
import { useCampus } from '../context/CampusContext';
import { Building2, Zap, Droplets, Calendar, Filter } from 'lucide-react';
import { ResourceType, TimePeriod } from '../types';

export const FilterBar: React.FC = () => {
  const {
    buildings,
    selectedBuildingId,
    setSelectedBuildingId,
    selectedResource,
    setSelectedResource,
    selectedTimePeriod,
    setSelectedTimePeriod,
  } = useCampus();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
      {/* Building Selector */}
      <div className="flex items-center space-x-2 min-w-[220px]">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <label htmlFor="building-select" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select Building / Block
          </label>
          <select
            id="building-select"
            value={selectedBuildingId}
            onChange={e => setSelectedBuildingId(e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
          >
            <option value="all">Entire Campus (All 6 Blocks)</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code}) {b.status === 'critical' ? '🚨' : b.status === 'warning' ? '⚠️' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Filter Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
        {[
          { id: 'both' as ResourceType, label: 'All Resources', icon: Filter },
          { id: 'electricity' as ResourceType, label: 'Electricity', icon: Zap },
          { id: 'water' as ResourceType, label: 'Water', icon: Droplets },
        ].map(item => {
          const Icon = item.icon;
          const isSelected = selectedResource === item.id;
          return (
            <button
              key={item.id}
              id={`filter-resource-${item.id}`}
              onClick={() => setSelectedResource(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  item.id === 'electricity'
                    ? 'text-amber-500'
                    : item.id === 'water'
                    ? 'text-blue-500'
                    : 'text-slate-500'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Time Period Selector Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
        {[
          { id: 'today' as TimePeriod, label: 'Today (Live)' },
          { id: 'week' as TimePeriod, label: 'This Week' },
          { id: 'month' as TimePeriod, label: 'This Month' },
        ].map(item => {
          const isSelected = selectedTimePeriod === item.id;
          return (
            <button
              key={item.id}
              id={`filter-period-${item.id}`}
              onClick={() => setSelectedTimePeriod(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
