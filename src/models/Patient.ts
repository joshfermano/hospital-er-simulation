export const PatientStatus = {
  WAITING: 0,
  WITH_RECEPTIONIST: 1,
  WAITING_FOR_NURSE: 2,
  WITH_NURSE: 3,
  WAITING_FOR_DOCTOR: 4,
  WITH_DOCTOR: 5,
  TREATED: 6,
} as const;

export type PatientStatus = (typeof PatientStatus)[keyof typeof PatientStatus];

export const PatientPriority = {
  CRITICAL: 0,
  URGENT: 1,
  STANDARD: 2,
} as const;

export type PatientPriority =
  (typeof PatientPriority)[keyof typeof PatientPriority];

export class Patient {
  public id: number;
  public status: PatientStatus;
  public priority: PatientPriority;
  public arrivalTime: number;
  public completionTime: number | null = null;
  public symptoms: string;

  constructor(id: number, priority: PatientPriority, arrivalTime: number) {
    this.id = id;
    this.status = PatientStatus.WAITING;
    this.priority = priority;
    this.arrivalTime = arrivalTime;
    this.symptoms = this.generateRandomSymptoms(priority);
  }

  public getWaitTime(currentTime: number): number {
    if (this.completionTime !== null) {
      return this.completionTime - this.arrivalTime;
    }
    return currentTime - this.arrivalTime;
  }

  public getStatusText(): string {
    switch (this.status) {
      case PatientStatus.WAITING:
        return 'Waiting for Registration';
      case PatientStatus.WITH_RECEPTIONIST:
        return 'Being Registered';
      case PatientStatus.WAITING_FOR_NURSE:
        return 'Waiting for Nurse';
      case PatientStatus.WITH_NURSE:
        return 'With Nurse';
      case PatientStatus.WAITING_FOR_DOCTOR:
        return 'Waiting for Doctor';
      case PatientStatus.WITH_DOCTOR:
        return 'With Doctor';
      case PatientStatus.TREATED:
        return 'Treated';
      default:
        return 'Unknown';
    }
  }

  public getPriorityText(): string {
    switch (this.priority) {
      case PatientPriority.CRITICAL:
        return 'Critical';
      case PatientPriority.URGENT:
        return 'Urgent';
      case PatientPriority.STANDARD:
        return 'Standard';
      default:
        return 'Unknown';
    }
  }

  public getPriorityColor(): string {
    switch (this.priority) {
      case PatientPriority.CRITICAL:
        return 'bg-red-500';
      case PatientPriority.URGENT:
        return 'bg-yellow-500';
      case PatientPriority.STANDARD:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  }

  private generateRandomSymptoms(priority: PatientPriority): string {
    const criticalSymptoms = [
      'Severe chest pain',
      'Stroke symptoms',
      'Major trauma',
      'Difficulty breathing',
      'Unconscious',
      'Severe bleeding',
    ];

    const urgentSymptoms = [
      'Abdominal pain',
      'Moderate trauma',
      'High fever',
      'Dehydration',
      'Persistent vomiting',
      'Minor fractures',
    ];

    const standardSymptoms = [
      'Minor cuts',
      'Cold symptoms',
      'Sore throat',
      'Mild fever',
      'Sprain',
      'Earache',
    ];

    let symptomsPool: string[];

    switch (priority) {
      case PatientPriority.CRITICAL:
        symptomsPool = criticalSymptoms;
        break;
      case PatientPriority.URGENT:
        symptomsPool = urgentSymptoms;
        break;
      case PatientPriority.STANDARD:
        symptomsPool = standardSymptoms;
        break;
      default:
        symptomsPool = standardSymptoms;
    }

    const randomIndex = Math.floor(Math.random() * symptomsPool.length);
    return symptomsPool[randomIndex];
  }
}
