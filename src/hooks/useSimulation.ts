import { useState, useEffect, useCallback } from 'react';
import {
  SimulationEngine,
  type SimulationStats,
} from '../models/SimulationEngine';
import { Patient, PatientPriority } from '../models/Patient';
import { Staff, StaffRole } from '../models/Staff';

export function useSimulation() {
  const [simulationEngine] = useState<SimulationEngine>(
    () => new SimulationEngine()
  );
  const [patients, setPatients] = useState<Patient[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [stats, setStats] = useState<SimulationStats>(
    simulationEngine.getStats()
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [arrivalRate, setArrivalRate] = useState<number>(10);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);

  // Initialize the simulation
  useEffect(() => {
    // Add initial staff
    simulationEngine.addStaff(StaffRole.DOCTOR, 6);
    simulationEngine.addStaff(StaffRole.NURSE, 6);
    simulationEngine.addStaff(StaffRole.RECEPTIONIST, 2);

    // Set up update callback
    simulationEngine.onUpdate(() => {
      console.log('Simulation update triggered');
      // Create deep copies of the state objects to ensure React detects changes
      const updatedPatients = [...simulationEngine.getPatients()];
      const updatedStaff = [...simulationEngine.getStaff()];
      const updatedStats = { ...simulationEngine.getStats() };

      console.log('Updated stats:', {
        totalPatients: updatedStats.totalPatients,
        treatedPatients: updatedStats.treatedPatients,
        averageWaitTime: updatedStats.averageWaitTime / 60, // Convert to minutes for readability
        staffUtilization: updatedStats.staffUtilization,
      });

      setPatients(updatedPatients);
      setStaff(updatedStaff);
      setStats(updatedStats);
    });

    // Initial state update
    setPatients([...simulationEngine.getPatients()]);
    setStaff([...simulationEngine.getStaff()]);

    return () => {
      // Cleanup
      simulationEngine.pause();
    };
  }, [simulationEngine]);

  // Handle changes to arrival rate
  useEffect(() => {
    simulationEngine.setArrivalRate(arrivalRate);
  }, [simulationEngine, arrivalRate]);

  // Handle changes to simulation speed
  useEffect(() => {
    simulationEngine.setSimulationSpeed(simulationSpeed);
  }, [simulationEngine, simulationSpeed]);

  const startSimulation = useCallback(() => {
    simulationEngine.start();
    setIsRunning(true);
  }, [simulationEngine]);

  const pauseSimulation = useCallback(() => {
    simulationEngine.pause();
    setIsRunning(false);
  }, [simulationEngine]);

  const resetSimulation = useCallback(() => {
    simulationEngine.reset();
    // Add initial staff after reset
    simulationEngine.addStaff(StaffRole.DOCTOR, 6);
    simulationEngine.addStaff(StaffRole.NURSE, 6);
    simulationEngine.addStaff(StaffRole.RECEPTIONIST, 2);

    setPatients([...simulationEngine.getPatients()]);
    setStaff([...simulationEngine.getStaff()]);
    setStats({ ...simulationEngine.getStats() });
    setIsRunning(false);
  }, [simulationEngine]);

  const addStaff = useCallback(
    (role: StaffRole) => {
      simulationEngine.addStaff(role, 1);
      setStaff([...simulationEngine.getStaff()]);
    },
    [simulationEngine]
  );

  const removeStaff = useCallback(
    (role: StaffRole) => {
      const success = simulationEngine.removeStaff(role);
      if (success) {
        setStaff([...simulationEngine.getStaff()]);
      }
      return success;
    },
    [simulationEngine]
  );

  const addPatient = useCallback(
    (priority: PatientPriority) => {
      simulationEngine.manuallyAddPatient(priority);
    },
    [simulationEngine]
  );

  return {
    patients,
    staff,
    stats,
    isRunning,
    arrivalRate,
    setArrivalRate,
    simulationSpeed,
    setSimulationSpeed,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    addStaff,
    removeStaff,
    addPatient,
  };
}
