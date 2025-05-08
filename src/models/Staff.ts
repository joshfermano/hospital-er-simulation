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
    console.log(`Created new staff member: ${this.id}, role: ${role}`);
  }

  public isBusy(): boolean {
    const currentTime = Date.now() / 1000;
    const busy = this.currentPatientId !== null && currentTime < this.busyUntil;

    if (this.currentPatientId !== null) {
      const timeRemaining = Math.max(0, this.busyUntil - currentTime);
      console.log(
        `Staff ${this.id} (${
          this.role
        }) busy status: ${busy}, time remaining: ${timeRemaining.toFixed(1)}s`
      );
    }

    return busy;
  }

  public isDone(currentTime: number): boolean {
    return this.currentPatientId !== null && currentTime >= this.busyUntil;
  }

  public assignPatient(
    patient: { id: number },
    processingTimeMinutes: number
  ): void {
    const processingTimeSeconds = processingTimeMinutes * 60;

    this.currentPatientId = patient.id;
    this.busyUntil = Date.now() / 1000 + processingTimeSeconds;

    console.log(
      `Staff ${this.id} (${this.role}) assigned patient ${patient.id}, ` +
        `processing time: ${processingTimeMinutes.toFixed(1)} minutes, ` +
        `busy until: ${new Date(this.busyUntil * 1000).toTimeString()}`
    );
  }

  public releasePatient(): void {
    console.log(
      `Staff ${this.id} (${this.role}) released patient ${this.currentPatientId}`
    );
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
