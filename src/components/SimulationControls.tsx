import React from 'react';
import { PatientPriority } from '../models/Patient';

interface SimulationControlsProps {
  isRunning: boolean;
  arrivalRate: number;
  simulationSpeed: number;
  setArrivalRate: (rate: number) => void;
  setSimulationSpeed: (speed: number) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  addPatient: (priority: PatientPriority) => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  arrivalRate,
  simulationSpeed,
  setArrivalRate,
  setSimulationSpeed,
  startSimulation,
  pauseSimulation,
  resetSimulation,
  addPatient,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="arrival-rate"
            className="block text-xs font-medium text-stone-600 mb-2">
            Patient Arrival Rate (per hour)
          </label>
          <input
            id="arrival-rate"
            type="range"
            min="1"
            max="30"
            step="1"
            value={arrivalRate}
            onChange={(e) => setArrivalRate(Number(e.target.value))}
            className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-700"
            disabled={isRunning}
          />
          <div className="flex justify-between text-xs text-stone-500 mt-1.5">
            <span>1</span>
            <span className="font-medium">{arrivalRate}</span>
            <span>30</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="simulation-speed"
            className="block text-xs font-medium text-stone-600 mb-2">
            Simulation Speed
          </label>
          <input
            id="simulation-speed"
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(Number(e.target.value))}
            className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-700"
          />
          <div className="flex justify-between text-xs text-stone-500 mt-1.5">
            <span>0.5x</span>
            <span className="font-medium">{simulationSpeed}x</span>
            <span>10x</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {!isRunning ? (
          <button
            onClick={startSimulation}
            className="bg-stone-800 hover:bg-stone-900 text-white px-4 py-1.5 rounded-md text-sm transition-colors">
            Start Simulation
          </button>
        ) : (
          <button
            onClick={pauseSimulation}
            className="bg-stone-600 hover:bg-stone-700 text-white px-4 py-1.5 rounded-md text-sm transition-colors">
            Pause Simulation
          </button>
        )}

        <button
          onClick={resetSimulation}
          className="border border-stone-300 hover:bg-stone-100 text-stone-700 px-4 py-1.5 rounded-md text-sm transition-colors">
          Reset Simulation
        </button>
      </div>

      <div className="pt-4 border-t border-stone-100">
        <h3 className="text-xs font-medium mb-3 text-stone-700">
          Add Patient Manually
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => addPatient(PatientPriority.CRITICAL)}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 px-3 py-1.5 rounded-md text-xs transition-colors">
            Critical Patient
          </button>
          <button
            onClick={() => addPatient(PatientPriority.URGENT)}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 px-3 py-1.5 rounded-md text-xs transition-colors">
            Urgent Patient
          </button>
          <button
            onClick={() => addPatient(PatientPriority.STANDARD)}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 px-3 py-1.5 rounded-md text-xs transition-colors">
            Standard Patient
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;
