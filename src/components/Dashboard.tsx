import React, { useEffect } from 'react';
import PatientQueue from './PatientQueue';
import SimulationControls from './SimulationControls';
import StaffManagement from './StaffManagement';
import PerformanceMetrics from './PerformanceMetrics';
import { Staff, StaffRole } from '../models/Staff';
import { Patient, PatientPriority } from '../models/Patient';
import type { SimulationStats } from '../models/SimulationEngine';
import { formatTime } from '../utils/statistics';

interface DashboardProps {
  patients: Patient[];
  staff: Staff[];
  stats: SimulationStats;
  isRunning: boolean;
  arrivalRate: number;
  simulationSpeed: number;
  setArrivalRate: (rate: number) => void;
  setSimulationSpeed: (speed: number) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  addStaff: (role: StaffRole) => void;
  removeStaff: (role: StaffRole) => boolean;
  addPatient: (priority: PatientPriority) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  patients,
  staff,
  stats,
  isRunning,
  arrivalRate,
  simulationSpeed,
  setArrivalRate,
  setSimulationSpeed,
  startSimulation,
  pauseSimulation,
  resetSimulation,
  addStaff,
  removeStaff,
  addPatient,
}) => {
  useEffect(() => {
    if (stats.treatedPatients > 0) {
      console.log('Stats:', {
        treatedPatients: stats.treatedPatients,
        averageWaitTime: stats.averageWaitTime,
        formattedTime: formatTime(stats.averageWaitTime / 60),
      });
    }
  }, [stats.treatedPatients, stats.averageWaitTime]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-medium mb-5 text-stone-800 border-b border-stone-100 pb-3">
            Simulation Controls
          </h2>
          <SimulationControls
            isRunning={isRunning}
            arrivalRate={arrivalRate}
            simulationSpeed={simulationSpeed}
            setArrivalRate={setArrivalRate}
            setSimulationSpeed={setSimulationSpeed}
            startSimulation={startSimulation}
            pauseSimulation={pauseSimulation}
            resetSimulation={resetSimulation}
            addPatient={addPatient}
          />
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-medium mb-5 text-stone-800 border-b border-stone-100 pb-3">
            Patient Queue
          </h2>
          <PatientQueue patients={patients} />
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-medium mb-5 text-stone-800 border-b border-stone-100 pb-3">
            Performance Metrics
          </h2>
          <PerformanceMetrics stats={stats} />
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-medium mb-5 text-stone-800 border-b border-stone-100 pb-3">
            Staff Management
          </h2>
          <StaffManagement
            staff={staff}
            addStaff={addStaff}
            removeStaff={removeStaff}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
