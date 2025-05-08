import React, { useState, useEffect } from 'react';
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
  // Track time elapsed since simulation started
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Update elapsed time when simulation is running
  useEffect(() => {
    let interval: number | null = null;

    if (isRunning) {
      if (!startTime) {
        setStartTime(Date.now());
      }

      interval = window.setInterval(() => {
        const now = Date.now();
        if (startTime) {
          setElapsedTime(Math.floor((now - startTime) / 1000));
        }
      }, 1000);
    } else if (!isRunning && startTime) {
      // When paused, keep the current elapsed time
      if (interval) {
        window.clearInterval(interval);
      }
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [isRunning, startTime]);

  // Reset timer when simulation is reset
  const handleReset = () => {
    setElapsedTime(0);
    setStartTime(null);
    resetSimulation();
  };

  // Format elapsed time as HH:MM:SS
  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours > 0 ? String(hours).padStart(2, '0') : null,
      String(minutes).padStart(2, '0'),
      String(secs).padStart(2, '0'),
    ]
      .filter(Boolean)
      .join(':');
  };

  return (
    <div className="space-y-6">
      <div className="bg-stone-800 text-white px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
        <div className="text-sm">
          <div className="text-stone-400">Simulation Time</div>
          <div className="text-xl font-mono">
            {formatElapsedTime(elapsedTime)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isRunning ? (
            <button
              onClick={startSimulation}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-sm transition-colors flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              Start
            </button>
          ) : (
            <button
              onClick={pauseSimulation}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-md text-sm transition-colors flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Pause
            </button>
          )}
          <button
            onClick={handleReset}
            className="border border-stone-600 hover:bg-stone-700 text-white px-4 py-1.5 rounded-md text-sm transition-colors flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="arrival-rate"
            className="block text-xs font-medium text-stone-600 mb-2 flex justify-between">
            <span>Patient Arrival Rate (per hour)</span>
            <span className="text-stone-800 font-bold">{arrivalRate}</span>
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
            <span>15</span>
            <span>30</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="simulation-speed"
            className="block text-xs font-medium text-stone-600 mb-2 flex justify-between">
            <span>Simulation Speed</span>
            <span className="text-stone-800 font-bold">{simulationSpeed}x</span>
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
            <span>5x</span>
            <span>10x</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-stone-100">
        <h3 className="text-xs font-medium mb-3 text-stone-700 flex items-center">
          Add Patient Manually
          <span className="ml-2 px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-xs">
            For testing
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => addPatient(PatientPriority.CRITICAL)}
            className="bg-red-100 hover:bg-red-200 text-red-800 border border-red-200 px-3 py-1 rounded-md text-xs transition-colors flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Critical Patient
          </button>
          <button
            onClick={() => addPatient(PatientPriority.URGENT)}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-200 px-3 py-1 rounded-md text-xs transition-colors flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Urgent Patient
          </button>
          <button
            onClick={() => addPatient(PatientPriority.STANDARD)}
            className="bg-green-100 hover:bg-green-200 text-green-800 border border-green-200 px-3 py-1 rounded-md text-xs transition-colors flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Standard Patient
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;
