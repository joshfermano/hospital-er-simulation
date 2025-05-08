import React from 'react';
import { Patient, PatientStatus } from '../models/Patient';
import PatientCard from './PatientCard';

interface PatientQueueProps {
  patients: Patient[];
}

const PatientQueue: React.FC<PatientQueueProps> = ({ patients }) => {
  const patientGroups = React.useMemo(() => {
    const waitingForRegistration = patients.filter(
      (p) => p.status === PatientStatus.WAITING
    );
    const inRegistration = patients.filter(
      (p) => p.status === PatientStatus.WITH_RECEPTIONIST
    );
    const waitingForNurse = patients.filter(
      (p) => p.status === PatientStatus.WAITING_FOR_NURSE
    );
    const withNurse = patients.filter(
      (p) => p.status === PatientStatus.WITH_NURSE
    );
    const waitingForDoctor = patients.filter(
      (p) => p.status === PatientStatus.WAITING_FOR_DOCTOR
    );
    const withDoctor = patients.filter(
      (p) => p.status === PatientStatus.WITH_DOCTOR
    );

    return {
      waitingForRegistration,
      inRegistration,
      waitingForNurse,
      withNurse,
      waitingForDoctor,
      withDoctor,
    };
  }, [patients]);

  if (patients.length === 0) {
    return (
      <div className="text-center py-8 text-stone-400 italic text-sm">
        No patients in the system. Start the simulation or add patients
        manually.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QueueSection
          title="Waiting for Registration"
          patients={patientGroups.waitingForRegistration}
          emptyMessage="No patients waiting"
          iconText="🧍"
        />
        <QueueSection
          title="In Registration"
          patients={patientGroups.inRegistration}
          emptyMessage="No patients in registration"
          iconText="📝"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QueueSection
          title="Waiting for Nurse"
          patients={patientGroups.waitingForNurse}
          emptyMessage="No patients waiting"
          iconText="⏳"
        />
        <QueueSection
          title="With Nurse"
          patients={patientGroups.withNurse}
          emptyMessage="No patients with nurse"
          iconText="👩‍⚕️"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QueueSection
          title="Waiting for Doctor"
          patients={patientGroups.waitingForDoctor}
          emptyMessage="No patients waiting"
          iconText="⏳"
        />
        <QueueSection
          title="With Doctor"
          patients={patientGroups.withDoctor}
          emptyMessage="No patients with doctor"
          iconText="👨‍⚕️"
        />
      </div>
    </div>
  );
};

interface QueueSectionProps {
  title: string;
  patients: Patient[];
  emptyMessage: string;
  iconText?: string;
}

const QueueSection: React.FC<QueueSectionProps> = ({
  title,
  patients,
  emptyMessage,
  iconText,
}) => {
  // Sort patients by priority and then by wait time
  const sortedPatients = React.useMemo(() => {
    return [...patients].sort((a, b) => {
      // First sort by priority (lower number = higher priority)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      // Then by wait time (higher time = higher priority)
      const currentTime = Date.now() / 1000;
      return b.getWaitTime(currentTime) - a.getWaitTime(currentTime);
    });
  }, [patients]);

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 text-stone-700 flex items-center justify-between">
        <span>{title}</span>
        {patients.length > 0 && (
          <span className="bg-stone-200 text-stone-700 text-xs px-2 py-0.5 rounded-full">
            {patients.length}
          </span>
        )}
      </h3>
      <div className="border border-stone-200 rounded-lg bg-stone-50 p-2 min-h-24 transition-all duration-200">
        {sortedPatients.length > 0 ? (
          <div className="space-y-2">
            {sortedPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-stone-400 italic flex flex-col items-center justify-center h-16">
            {iconText && <span className="text-xl mb-1">{iconText}</span>}
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientQueue;
