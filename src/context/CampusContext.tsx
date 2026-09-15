import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  CampusBuilding,
  Anomaly,
  AlertItem,
  AIRecommendation,
  ResourceType,
  TimePeriod,
  UserProfile,
  UserRole,
  CampusOverviewStats,
} from '../types';
import {
  INITIAL_BUILDINGS,
  INITIAL_ANOMALIES,
  INITIAL_ALERTS,
  INITIAL_RECOMMENDATIONS,
} from '../data/mockCampusData';
import { auth, db, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

interface SimulateAnomalyParams {
  buildingId: string;
  resource: 'electricity' | 'water';
  title: string;
  reason: string;
  excessValue: number;
  unit: string;
  excessPct: number;
  recommendedAction: string;
}

interface CampusContextType {
  user: UserProfile | null;
  loginAsDemo: (role?: UserRole) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  buildings: CampusBuilding[];
  selectedBuildingId: string;
  setSelectedBuildingId: (id: string) => void;
  selectedResource: ResourceType;
  setSelectedResource: (resource: ResourceType) => void;
  selectedTimePeriod: TimePeriod;
  setSelectedTimePeriod: (period: TimePeriod) => void;
  liveMonitoringActive: boolean;
  setLiveMonitoringActive: (active: boolean) => void;
  anomalies: Anomaly[];
  alerts: AlertItem[];
  recommendations: AIRecommendation[];
  campusStats: CampusOverviewStats;
  simulateAnomaly: (params?: Partial<SimulateAnomalyParams>) => void;
  resolveAlert: (alertId: string) => void;
  resolveAnomaly: (anomalyId: string) => void;
  generateRecommendation: () => Promise<AIRecommendation>;
  activeNotification: string | null;
  dismissNotification: () => void;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export function CampusProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('ecocampus_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to demo logged-in user so the reviewer has immediate access
    return {
      uid: 'demo-user-1',
      email: 'facilities.lead@ecocampus.edu',
      displayName: 'Alex Morgan',
      role: 'Energy Officer',
      isDemoUser: true,
    };
  });

  // State
  const [buildings, setBuildings] = useState<CampusBuilding[]>(INITIAL_BUILDINGS);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(() => {
    const saved = localStorage.getItem('ecocampus_anomalies');
    return saved ? JSON.parse(saved) : INITIAL_ANOMALIES;
  });
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const saved = localStorage.getItem('ecocampus_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(() => {
    const saved = localStorage.getItem('ecocampus_recommendations');
    return saved ? JSON.parse(saved) : INITIAL_RECOMMENDATIONS;
  });

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<ResourceType>('both');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('today');
  const [liveMonitoringActive, setLiveMonitoringActive] = useState<boolean>(true);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Sync with Firebase Auth
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, fbUser => {
      if (fbUser) {
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || 'user@ecocampus.edu',
          displayName: fbUser.displayName || 'Campus Officer',
          photoURL: fbUser.photoURL || undefined,
          role: 'Energy Officer',
          isDemoUser: false,
        };
        setUser(profile);
        localStorage.setItem('ecocampus_user', JSON.stringify(profile));
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore for remote simulated alerts if Firestore is ready
  useEffect(() => {
    if (!db) return;
    try {
      const colRef = collection(db, 'simulatedAlerts');
      const unsub = onSnapshot(
        colRef,
        snapshot => {
          if (!snapshot.empty) {
            const remoteAlerts: AlertItem[] = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data();
              remoteAlerts.push({
                id: docSnap.id,
                severity: data.severity || 'high',
                title: data.title || 'Simulated Event',
                time: 'Just now',
                buildingId: data.buildingId,
                buildingName: data.buildingName,
                resource: data.resource,
                recommendedAction: data.recommendedAction,
                resolved: data.resolved ?? false,
                excessPct: data.excessPct || 25,
                reason: data.reason,
                simulated: true,
              });
            });

            // Merge with local alerts avoiding duplicates
            setAlerts(prev => {
              const remoteIds = new Set(remoteAlerts.map(a => a.id));
              const nonDuplicated = prev.filter(p => !remoteIds.has(p.id));
              return [...remoteAlerts, ...nonDuplicated];
            });
          }
        },
        err => {
          console.info('Firestore offline/permissions fallback - utilizing local cache:', err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.info('Firestore listener initialized with local fallback:', e);
    }
  }, []);

  // Simulated live monitoring ticker: slightly fluctuates instantaneous values every 3 seconds
  useEffect(() => {
    if (!liveMonitoringActive) return;

    const interval = setInterval(() => {
      setBuildings(prev =>
        prev.map(b => {
          // slight random jitter: +/- 1.5%
          const jitterKw = (Math.random() - 0.5) * 1.8;
          const jitterFlow = (Math.random() - 0.5) * 0.9;
          const newKw = Math.max(10, Math.round((b.currentPowerKw + jitterKw) * 10) / 10);
          const newFlow = Math.max(2, Math.round((b.currentWaterFlowLpm + jitterFlow) * 10) / 10);

          return {
            ...b,
            currentPowerKw: newKw,
            currentWaterFlowLpm: newFlow,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [liveMonitoringActive]);

  // Persist state updates to localStorage
  useEffect(() => {
    localStorage.setItem('ecocampus_anomalies', JSON.stringify(anomalies));
  }, [anomalies]);

  useEffect(() => {
    localStorage.setItem('ecocampus_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('ecocampus_recommendations', JSON.stringify(recommendations));
  }, [recommendations]);

  // Demo Login
  const loginAsDemo = (role: UserRole = 'Energy Officer') => {
    const demoUser: UserProfile = {
      uid: 'demo-user-' + Date.now(),
      email: 'officer@ecocampus.edu',
      displayName: 'Alex Morgan',
      role,
      isDemoUser: true,
    };
    setUser(demoUser);
    localStorage.setItem('ecocampus_user', JSON.stringify(demoUser));
    setActiveNotification(`Logged in as ${demoUser.displayName} (${role})`);
  };

  // Google Sign-In with Firebase Auth
  const signInWithGoogle = async () => {
    if (!auth) {
      loginAsDemo('Energy Officer');
      return;
    }
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const profile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email || 'user@ecocampus.edu',
        displayName: res.user.displayName || 'Campus Energy Lead',
        photoURL: res.user.photoURL || undefined,
        role: 'Energy Officer',
        isDemoUser: false,
      };
      setUser(profile);
      localStorage.setItem('ecocampus_user', JSON.stringify(profile));
      setActiveNotification(`Signed in with Google as ${profile.displayName}`);
    } catch (err: any) {
      console.warn('Google Sign-In popup notice, falling back to Demo Login:', err.message);
      loginAsDemo('Facility Director');
    }
  };

  const signOut = async () => {
    try {
      if (auth) {
        await fbSignOut(auth);
      }
    } catch (err) {
      console.warn('Signout notice:', err);
    }
    setUser(null);
    localStorage.removeItem('ecocampus_user');
    setActiveNotification('Signed out successfully.');
  };

  // Simulate Anomaly
  const simulateAnomaly = (customParams?: Partial<SimulateAnomalyParams>) => {
    const defaultScenarios = [
      {
        buildingId: 'cse-block',
        buildingName: 'CSE Block',
        resource: 'electricity' as const,
        title: 'CSE Server Lab HVAC Inefficiency Surge',
        reason: 'Overnight AI training cluster HVAC left at 18°C with unconstrained chillers; draw rose 44% above night baseline.',
        excessValue: 240,
        unit: 'kWh',
        excessPct: 44,
        recommendedAction: 'Remotely increase research rack cooling setpoint to 23°C and activate dynamic server power cap.',
      },
      {
        buildingId: 'hostel-block',
        buildingName: 'Hostel Block',
        resource: 'water' as const,
        title: 'Hostel Wing B Flush Valve Pipe Rupture',
        reason: 'Sudden continuous flow of 54 L/min detected in 3rd-floor common washroom riser with immediate pressure drop.',
        excessValue: 8400,
        unit: 'Liters',
        excessPct: 50,
        recommendedAction: 'Isolate Wing B riser gate valve #4 and dispatch on-duty emergency plumbing squad.',
      },
      {
        buildingId: 'central-library',
        buildingName: 'Central Library',
        resource: 'electricity' as const,
        title: 'Library 4th Floor Night Lighting Override',
        reason: 'Manual bypass switch engaged on master circuit; 120 LED high-bay panels illuminated during closed hours.',
        excessValue: 65,
        unit: 'kWh',
        excessPct: 28,
        recommendedAction: 'Reset lighting control relay to automated astronomical clock schedule.',
      },
      {
        buildingId: 'mech-block',
        buildingName: 'Mechanical Block',
        resource: 'water' as const,
        title: 'Hydraulics Flume Overflow Alert',
        reason: 'Recirculation filtration valve stuck partially open; makeup water line continuously drawing 22 L/min.',
        excessValue: 3200,
        unit: 'Liters',
        excessPct: 35,
        recommendedAction: 'Engage manual bypass valve and recalibrate ultrasonic water-level optical sensor.',
      },
    ];

    // Pick scenario or merge custom
    const baseScenario = defaultScenarios[Math.floor(Math.random() * defaultScenarios.length)];
    const chosenBuildingId = customParams?.buildingId || baseScenario.buildingId;
    const targetBuilding = buildings.find(b => b.id === chosenBuildingId) || buildings[0];

    const title = customParams?.title || baseScenario.title;
    const reason = customParams?.reason || baseScenario.reason;
    const resource = customParams?.resource || baseScenario.resource;
    const excessValue = customParams?.excessValue || baseScenario.excessValue;
    const unit = customParams?.unit || (resource === 'electricity' ? 'kWh' : 'Liters');
    const excessPct = customParams?.excessPct || baseScenario.excessPct;
    const recommendedAction = customParams?.recommendedAction || baseScenario.recommendedAction;

    const newId = `anom-${Date.now()}`;
    const newAlertId = `alert-${Date.now()}`;

    const newAnomaly: Anomaly = {
      id: newId,
      severity: 'high',
      buildingId: targetBuilding.id,
      buildingName: targetBuilding.name,
      resource,
      detectedAt: 'Just now (Simulated)',
      reason,
      estimatedExcess: `+${excessValue.toLocaleString()} ${unit}`,
      excessValue,
      unit,
      financialLossEst: resource === 'electricity' ? `$${(excessValue * 0.14).toFixed(2)}` : `$${((excessValue / 1000) * 3.2).toFixed(2)}`,
      status: 'investigating',
      simulated: true,
    };

    const newAlert: AlertItem = {
      id: newAlertId,
      severity: 'critical',
      title,
      time: 'Just now',
      buildingId: targetBuilding.id,
      buildingName: targetBuilding.name,
      resource,
      recommendedAction,
      resolved: false,
      excessPct,
      reason,
      simulated: true,
    };

    // Update building
    setBuildings(prev =>
      prev.map(b => {
        if (b.id === targetBuilding.id) {
          return {
            ...b,
            status: 'critical',
            currentKwh: resource === 'electricity' ? b.currentKwh + excessValue : b.currentKwh,
            currentLiters: resource === 'water' ? b.currentLiters + excessValue : b.currentLiters,
            wastageKwh: resource === 'electricity' ? b.wastageKwh + excessValue : b.wastageKwh,
            wastageLiters: resource === 'water' ? b.wastageLiters + excessValue : b.wastageLiters,
            sustainabilityScore: Math.max(45, b.sustainabilityScore - 12),
          };
        }
        return b;
      })
    );

    setAnomalies(prev => [newAnomaly, ...prev]);
    setAlerts(prev => [newAlert, ...prev]);

    // Save to Firestore if available
    if (db) {
      try {
        addDoc(collection(db, 'simulatedAlerts'), {
          ...newAlert,
          createdAt: serverTimestamp(),
        }).catch(e => console.info('Firestore save queued locally:', e.message));
      } catch (err) {
        console.info('Simulated alert stored in local state:', err);
      }
    }

    setActiveNotification(`🚨 New Anomaly Simulated: ${targetBuilding.name} (${title})`);
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, resolved: true } : a))
    );

    // Also update corresponding anomaly if present
    setAnomalies(prev =>
      prev.map(an => (an.id === alertId || an.id.includes(alertId) ? { ...an, status: 'resolved' } : an))
    );

    if (db) {
      try {
        updateDoc(doc(db, 'simulatedAlerts', alertId), { resolved: true }).catch(() => {});
      } catch {
        // Ignored
      }
    }

    setActiveNotification('Alert marked as resolved. Campus sustainability score adjusted.');
  };

  const resolveAnomaly = (anomalyId: string) => {
    setAnomalies(prev =>
      prev.map(a => (a.id === anomalyId ? { ...a, status: 'resolved' } : a))
    );
    setActiveNotification('Anomaly marked as resolved.');
  };

  // Generate Recommendation with Gemini API or smart local fallback
  const generateRecommendation = async (): Promise<AIRecommendation> => {
    setActiveNotification('AI Sustainability Advisor analyzing campus consumption...');
    try {
      const res = await fetch('/api/gemini/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildings: buildings.map(b => ({
            name: b.name,
            kwh: b.currentKwh,
            waterL: b.currentLiters,
            baselineKwh: b.normalAvgKwhDaily,
            baselineWater: b.normalAvgLitersDaily,
            score: b.sustainabilityScore,
            status: b.status,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newRec: AIRecommendation = {
          id: `rec-${Date.now()}`,
          title: data.title || 'Dynamic HVAC Setpoint Optimization',
          buildingName: data.buildingName || 'CSE Block',
          resource: data.resource || 'electricity',
          reason: data.reason || 'Telemetry confirms uncurtailed cooling loads during off-peak campus hours.',
          potentialSavings: data.potentialSavings || '310 kWh / Week ($160 / month)',
          estimatedRoi: data.estimatedRoi || 'Immediate',
          difficulty: data.difficulty || 'Quick Win',
          actionStatus: 'Pending',
          generatedAt: 'Just now (AI Gemini 3.1 Pro)',
        };
        setRecommendations(prev => [newRec, ...prev]);
        setActiveNotification(`✨ New AI Recommendation Generated for ${newRec.buildingName}!`);
        return newRec;
      }
    } catch (e) {
      console.info('Server API unreachable, using built-in intelligent recommendation generator:', e);
    }

    // Built-in intelligent local generator fallback
    const dynamicRecs = [
      {
        title: 'Install Variable Frequency Drives (VFD) on Main Campus Water Pumps',
        buildingName: 'Hostel Block',
        resource: 'water' as const,
        reason: 'Current dual-stage 15 HP pumps run at fixed RPM causing pressure oscillations and excessive bypass backflow during low-demand midday hours.',
        potentialSavings: '18,500 Liters / Week & 450 kWh ($340 / month)',
        estimatedRoi: '2 Months (VFD retrofit)',
        difficulty: 'Scheduled Maintenance' as const,
      },
      {
        title: 'Implement Automated Idle Disconnect on ECE Test Benches',
        buildingName: 'ECE Block',
        resource: 'electricity' as const,
        reason: 'RF power amplifiers and bench DC supplies remain powered down in stand-by consuming 9.4 kW continuous draw overnight.',
        potentialSavings: '190 kWh / Week ($98 / month)',
        estimatedRoi: 'Immediate (Master relay timer)',
        difficulty: 'Quick Win' as const,
      },
      {
        title: 'Smart Occupancy-Coupled Daylight Harvesting in Library',
        buildingName: 'Central Library',
        resource: 'electricity' as const,
        reason: 'North-facing reading atriums have ample ambient daylight (>450 lux) while lighting circuits remain locked at full illumination.',
        potentialSavings: '135 kWh / Week ($70 / month)',
        estimatedRoi: '3 Weeks (Photocell calibration)',
        difficulty: 'Quick Win' as const,
      },
    ];

    const pick = dynamicRecs[Math.floor(Math.random() * dynamicRecs.length)];
    const fallbackRec: AIRecommendation = {
      id: `rec-${Date.now()}`,
      title: pick.title,
      buildingName: pick.buildingName,
      resource: pick.resource,
      reason: pick.reason,
      potentialSavings: pick.potentialSavings,
      estimatedRoi: pick.estimatedRoi,
      difficulty: pick.difficulty,
      actionStatus: 'Pending',
      generatedAt: 'Just now (AI Advisor)',
    };

    setRecommendations(prev => [fallbackRec, ...prev]);
    setActiveNotification(`✨ AI Recommendation Generated for ${fallbackRec.buildingName}!`);
    return fallbackRec;
  };

  // Calculated Overview Stats
  const campusStats = useMemo<CampusOverviewStats>(() => {
    const totalElec = buildings.reduce((acc, b) => acc + b.currentKwh, 0);
    const totalWater = buildings.reduce((acc, b) => acc + b.currentLiters, 0);
    const wasteElec = buildings.reduce((acc, b) => acc + b.wastageKwh, 0);
    const wasteWater = buildings.reduce((acc, b) => acc + b.wastageLiters, 0);

    // Average sustainability score weighted by building size
    const avgScore = Math.round(
      buildings.reduce((acc, b) => acc + b.sustainabilityScore, 0) / buildings.length
    );

    const activeAlerts = alerts.filter(a => !a.resolved).length;

    let scoreGrade = 'A';
    if (avgScore < 60) scoreGrade = 'D';
    else if (avgScore < 70) scoreGrade = 'C';
    else if (avgScore < 80) scoreGrade = 'B';
    else if (avgScore < 90) scoreGrade = 'A-';
    else scoreGrade = 'A+';

    // Cost estimate: $0.14/kWh electricity, $0.0032/L water
    const costWasted = Math.round(wasteElec * 0.14 + wasteWater * 0.0032);
    // Carbon footprint: ~0.82 kg CO2 per kWh
    const carbonAvoidable = Math.round(wasteElec * 0.82);

    const peakDemand = Math.round(buildings.reduce((acc, b) => acc + b.currentPowerKw, 0));

    return {
      totalElectricityToday: totalElec,
      totalWaterToday: totalWater,
      estimatedWastageKwh: wasteElec,
      estimatedWastageLiters: wasteWater,
      estimatedCostWasted: costWasted,
      carbonAvoidableKg: carbonAvoidable,
      sustainabilityScore: avgScore,
      scoreGrade,
      activeAlertsCount: activeAlerts,
      peakDemandKw: peakDemand,
      peakCapacityKw: 550, // 550 kW campus transformer capacity
    };
  }, [buildings, alerts]);

  const dismissNotification = () => setActiveNotification(null);

  return (
    <CampusContext.Provider
      value={{
        user,
        loginAsDemo,
        signInWithGoogle,
        signOut,
        buildings,
        selectedBuildingId,
        setSelectedBuildingId,
        selectedResource,
        setSelectedResource,
        selectedTimePeriod,
        setSelectedTimePeriod,
        liveMonitoringActive,
        setLiveMonitoringActive,
        anomalies,
        alerts,
        recommendations,
        campusStats,
        simulateAnomaly,
        resolveAlert,
        resolveAnomaly,
        generateRecommendation,
        activeNotification,
        dismissNotification,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
}
