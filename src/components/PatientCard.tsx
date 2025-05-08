import React from 'react';
import { Patient } from '../models/Patient';
import { formatTime } from '../utils/statistics';

interface PatientCardProps {
  patient: Patient;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const currentTime = Date.now() / 1000; // Current time in seconds
  const waitTime = patient.getWaitTime(currentTime);

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-3 hover:bg-stone-50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-sm text-stone-800">
            Patient #{patient.id}
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            {patient.symptoms}
          </div>
        </div>
        <div
          className={`border ${getPriorityBorderColor(
            patient
          )} ${getPriorityBgColor(
            patient
          )} text-stone-800 text-xs px-2 py-0.5 rounded-full`}>
          {patient.getPriorityText()}
        </div>
      </div>

      <div className="mt-2 text-xs flex justify-between text-stone-600">
        <div>
          Status: <span className="font-medium">{patient.getStatusText()}</span>
        </div>
        <div>
          Wait: <span className="font-medium">{formatTime(waitTime / 60)}</span>
        </div>
      </div>
    </div>
  );
};

// Helper functions for minimalist priority styling
function getPriorityBorderColor(patient: Patient): string {
  switch (patient.priority) {
    case 0: // Critical
      return 'border-red-300';
    case 1: // Urgent
      return 'border-amber-300';
    case 2: // Standard
      return 'border-emerald-300';
    default:
      return 'border-stone-300';
  }
}

function getPriorityBgColor(patient: Patient): string {
  switch (patient.priority) {
    case 0: // Critical
      return 'bg-red-50 text-red-900';
    case 1: // Urgent
      return 'bg-amber-50 text-amber-900';
    case 2: // Standard
      return 'bg-emerald-50 text-emerald-900';
    default:
      return 'bg-stone-50 text-stone-900';
  }
}

export default PatientCard;
