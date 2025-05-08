import React from 'react';
import { Patient, PatientStatus } from '../models/Patient';
import PatientCard from './PatientCard';

interface PatientQueueProps {
  patients: Patient[];
}

const PatientQueue: React.FC<PatientQueueProps> = ({ patients }) => {
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

  if (patients.length === 0) {
    return (
      <div className="text-center py-8 text-stone-400 italic text-sm">
        No patients in the emergency room
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QueueSection
          title="Waiting for Registration"
          patients={waitingForRegistration}
          emptyMessage="No patients waiting"
        />
        <QueueSection
          title="In Registration"
          patients={inRegistration}
          emptyMessage="No patients in registration"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QueueSection
          title="Waiting for Nurse"
          patients={waitingForNurse}
          emptyMessage="No patients waiting"
        />
        <QueueSection
          title="With Nurse"
          patients={withNurse}
          emptyMessage="No patients with nurse"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QueueSection
          title="Waiting for Doctor"
          patients={waitingForDoctor}
          emptyMessage="No patients waiting"
        />
        <QueueSection
          title="With Doctor"
          patients={withDoctor}
          emptyMessage="No patients with doctor"
        />
      </div>
    </div>
  );
};

interface QueueSectionProps {
  title: string;
  patients: Patient[];
  emptyMessage: string;
}

const QueueSection: React.FC<QueueSectionProps> = ({
  title,
  patients,
  emptyMessage,
}) => {
  return (
    <div>
      <h3 className="text-xs font-medium mb-2 text-stone-700">{title}</h3>
      <div className="border border-stone-200 rounded-lg bg-stone-50 p-3 min-h-16">
        {patients.length > 0 ? (
          <div className="space-y-2">
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        ) : (
          <div className="text-center py-3 text-xs text-stone-400 italic">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientQueue;
