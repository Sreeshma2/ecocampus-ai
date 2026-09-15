/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CampusProvider, useCampus } from './context/CampusContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SimulateAnomalyModal } from './components/SimulateAnomalyModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { AnomaliesPage } from './pages/AnomaliesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { BuildingsPage } from './pages/BuildingsPage';
import { AlertsPage } from './pages/AlertsPage';
import { AIAdvisorPage } from './pages/AIAdvisorPage';
import { LoginPage } from './pages/LoginPage';

const MainLayout: React.FC = () => {
  const { user } = useCampus();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState<boolean>(false);

  // If user is on the login page specifically
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
        />
        <main className="flex-1">
          <LoginPage onLoginSuccess={() => setCurrentPage('dashboard')} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
      />

      {/* Body: Sidebar + Main Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0 pb-20 md:pb-12">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={page => setCurrentPage(page)}
              onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
            />
          )}

          {currentPage === 'monitoring' && <MonitoringPage />}

          {currentPage === 'anomalies' && (
            <AnomaliesPage
              onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
              onNavigateToAdvisor={() => setCurrentPage('advisor')}
            />
          )}

          {currentPage === 'analytics' && <AnalyticsPage />}

          {currentPage === 'buildings' && <BuildingsPage />}

          {currentPage === 'alerts' && (
            <AlertsPage
              onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
              onNavigateToAdvisor={() => setCurrentPage('advisor')}
            />
          )}

          {currentPage === 'advisor' && <AIAdvisorPage />}
        </main>
      </div>

      {/* Global Simulate Anomaly Modal */}
      <SimulateAnomalyModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onNavigateToAlerts={() => setCurrentPage('alerts')}
      />
    </div>
  );
};

export default function App() {
  return (
    <CampusProvider>
      <MainLayout />
    </CampusProvider>
  );
}
