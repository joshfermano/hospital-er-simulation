import React from 'react';
import { Patient, PatientPriority, PatientStatus } from '../models/Patient';
import { formatTime } from '../utils/statistics';

interface PatientCardProps {
  patient: Patient;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const currentTime = Date.now() / 1000; // Current time in seconds
  const waitTime = patient.getWaitTime(currentTime);

  const isWaitingTooLong = React.useMemo(() => {
    const thresholds = {
      [PatientPriority.CRITICAL]: 2,
      [PatientPriority.URGENT]: 10,
      [PatientPriority.STANDARD]: 30,
    };

    const waitTimeMinutes = waitTime / 60;
    return waitTimeMinutes > thresholds[patient.priority];
  }, [patient.priority, waitTime]);

  const getPriorityBadgeClass = () => {
    switch (patient.priority) {
      case PatientPriority.CRITICAL:
        return 'bg-red-100 text-red-800 border border-red-300';
      case PatientPriority.URGENT:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case PatientPriority.STANDARD:
        return 'bg-green-100 text-green-800 border border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getCardBackgroundClass = () => {
    let classes =
      'bg-white border border-stone-200 rounded-md p-3 transition-all duration-300';

    // Add status-specific styling
    if (patient.status === PatientStatus.TREATED) {
      return `${classes} bg-green-50 border-green-200`;
    }

    // Add styling for patients waiting too long
    if (
      isWaitingTooLong &&
      (patient.status === PatientStatus.WAITING ||
        patient.status === PatientStatus.WAITING_FOR_NURSE ||
        patient.status === PatientStatus.WAITING_FOR_DOCTOR)
    ) {
      return `${classes} bg-red-50 border-red-200`;
    }

    // Active treatment styling
    if (
      patient.status === PatientStatus.WITH_RECEPTIONIST ||
      patient.status === PatientStatus.WITH_NURSE ||
      patient.status === PatientStatus.WITH_DOCTOR
    ) {
      return `${classes} bg-blue-50 border-blue-200 shadow-sm`;
    }

    return classes;
  };

  const getStatusIndicator = () => {
    switch (patient.status) {
      case PatientStatus.WAITING:
        return isWaitingTooLong ? '⚠️' : '⏳';
      case PatientStatus.WITH_RECEPTIONIST:
        return '📋';
      case PatientStatus.WAITING_FOR_NURSE:
        return isWaitingTooLong ? '⚠️' : '⏳';
      case PatientStatus.WITH_NURSE:
        return '👩‍⚕️';
      case PatientStatus.WAITING_FOR_DOCTOR:
        return isWaitingTooLong ? '⚠️' : '⏳';
      case PatientStatus.WITH_DOCTOR:
        return '👨‍⚕️';
      case PatientStatus.TREATED:
        return '✅';
      default:
        return '❓';
    }
  };

  // Show progress indicator for patients in treatment
  const renderProgressBar = () => {
    // Only show for patients actively being treated
    if (
      patient.status !== PatientStatus.WITH_RECEPTIONIST &&
      patient.status !== PatientStatus.WITH_NURSE &&
      patient.status !== PatientStatus.WITH_DOCTOR
    ) {
      return null;
    }

    return (
      <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
        <div className="bg-blue-600 h-1 rounded-full animate-pulse"></div>
      </div>
    );
  };

  return (
    <div className={getCardBackgroundClass()}>
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium">Patient #{patient.id}</div>
          <div className="text-stone-600 text-sm">{patient.symptoms}</div>
        </div>
        <div
          className={`${getPriorityBadgeClass()} px-2 py-0.5 text-xs rounded-full`}>
          {patient.getPriorityText()}
        </div>
      </div>

      <div className="mt-2 text-xs flex justify-between text-stone-500">
        <div className="flex items-center">
          <span className="mr-1">{getStatusIndicator()}</span>
          <span className="font-medium">{patient.getStatusText()}</span>
        </div>
        <div
          className={`font-medium ${isWaitingTooLong ? 'text-red-600' : ''}`}>
          {formatTime(waitTime / 60)}
        </div>
      </div>

      {renderProgressBar()}
    </div>
  );
};

export default PatientCard;
