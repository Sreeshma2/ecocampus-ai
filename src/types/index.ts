export type ResourceType = 'electricity' | 'water' | 'both';
export type TimePeriod = 'today' | 'week' | 'month';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface SubmeterBreakdown {
  hvac: number; // percentage or kWh
  labs: number;
  lighting: number;
  pumps: number;
  general: number;
}

export interface CampusBuilding {
  id: string;
  name: string;
  code: string;
  category: 'Academic' | 'Lab / Research' | 'Administration' | 'Hostel / Residential' | 'Library';
  sqFt: number;
  occupancy: number;
  normalAvgKwhDaily: number;
  normalAvgLitersDaily: number;
  currentKwh: number;
  currentLiters: number;
  currentPowerKw: number;
  currentWaterFlowLpm: number;
  powerFactor: number;
  waterPressureBar: number;
  wastageKwh: number;
  wastageLiters: number;
  sustainabilityScore: number;
  status: 'normal' | 'warning' | 'critical';
  submeters: SubmeterBreakdown;
  description: string;
  primaryIssue?: string;
}

export interface Anomaly {
  id: string;
  severity: 'high' | 'medium' | 'low';
  buildingId: string;
  buildingName: string;
  resource: 'electricity' | 'water';
  detectedAt: string;
  reason: string;
  estimatedExcess: string;
  excessValue: number;
  unit: string;
  financialLossEst: string;
  status: 'investigating' | 'resolved' | 'acknowledged';
  simulated?: boolean;
}

export interface AlertItem {
  id: string;
  severity: SeverityLevel;
  title: string;
  time: string;
  buildingId: string;
  buildingName: string;
  resource: 'electricity' | 'water';
  recommendedAction: string;
  resolved: boolean;
  excessPct: number;
  reason: string;
  simulated?: boolean;
}

export interface AIRecommendation {
  id: string;
  title: string;
  buildingName: string;
  resource: 'electricity' | 'water';
  reason: string;
  potentialSavings: string;
  estimatedRoi: string;
  difficulty: 'Quick Win' | 'Scheduled Maintenance' | 'Operational Policy';
  actionStatus: 'Pending' | 'In Progress' | 'Implemented';
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  thinking?: string;
  suggestedAction?: string;
}

export interface CampusOverviewStats {
  totalElectricityToday: number;
  totalWaterToday: number;
  estimatedWastageKwh: number;
  estimatedWastageLiters: number;
  estimatedCostWasted: number;
  carbonAvoidableKg: number;
  sustainabilityScore: number;
  scoreGrade: string;
  activeAlertsCount: number;
  peakDemandKw: number;
  peakCapacityKw: number;
}

export interface HourlyTelemetryPoint {
  hour: string;
  electricityActual: number;
  electricityBaseline: number;
  waterActual: number;
  waterBaseline: number;
  isAnomalyHour?: boolean;
}

export interface DailyTrendPoint {
  day: string;
  electricityKwh: number;
  waterLiters: number;
  wastageKwh: number;
  wastageLiters: number;
}

export interface PredictionPoint {
  day: string;
  date: string;
  predictedKwh: number;
  lowerKwh: number;
  upperKwh: number;
  predictedLiters: number;
  lowerLiters: number;
  upperLiters: number;
  factorNote: string;
  isWeekend?: boolean;
}

export type UserRole = 'Facility Director' | 'Energy Officer' | 'Faculty Coordinator' | 'Student Green Lead';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  isDemoUser?: boolean;
}
