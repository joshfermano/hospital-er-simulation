export const StaffRole = {
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  RECEPTIONIST: 'RECEPTIONIST',
} as const;

export type StaffRole = (typeof StaffRole)[keyof typeof StaffRole];

export class Staff {
  public id: number;
  public role: StaffRole;
  public currentPatientId: number | null = null;
  public busyUntil: number = 0;
  private static lastId: number = 0;

  constructor(role: StaffRole) {
    this.id = ++Staff.lastId;
    this.role = role;
  }

  public isBusy(): boolean {
    return this.currentPatientId !== null;
  }

  public isDone(currentTime: number): boolean {
    return this.isBusy() && currentTime >= this.busyUntil;
  }

  public assignPatient(
    patient: { id: number },
    processingTimeMinutes: number
  ): void {
    this.currentPatientId = patient.id;
    this.busyUntil = Date.now() / 1000 + processingTimeMinutes * 60;
  }

  public releasePatient(): void {
    this.currentPatientId = null;
  }

  public reset(): void {
    this.currentPatientId = null;
    this.busyUntil = 0;
  }

  public getRoleName(): string {
    switch (this.role) {
      case StaffRole.DOCTOR:
        return 'Doctor';
      case StaffRole.NURSE:
        return 'Nurse';
      case StaffRole.RECEPTIONIST:
        return 'Receptionist';
      default:
        return 'Unknown';
    }
  }

  public getRoleColor(): string {
    switch (this.role) {
      case StaffRole.DOCTOR:
        return 'bg-blue-500';
      case StaffRole.NURSE:
        return 'bg-green-500';
      case StaffRole.RECEPTIONIST:
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  }
}
