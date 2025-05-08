import { Patient, PatientStatus, PatientPriority } from './Patient';
import { Staff, StaffRole } from './Staff';
import { generateExponentialTime, generateUniformTime } from '../utils/random';

export type SimulationStats = {
  totalPatients: number;
  treatedPatients: number;
  averageWaitTime: number;
  maxWaitTime: number;
  staffUtilization: Record<StaffRole, number>;
  queueLength: number;
  throughput: number;
};

export class SimulationEngine {
  private patients: Patient[] = [];
  private staff: Staff[] = [];
  private currentTime: number = 0;
  private lastPatientId: number = 0;
  private isRunning: boolean = false;
  private stats: SimulationStats;
  private arrivalRate: number = 10;
  private simulationSpeed: number = 1;
  private lastTick: number = 0;
  private onUpdateCallback: () => void = () => {};

  constructor() {
    this.stats = {
      totalPatients: 0,
      treatedPatients: 0,
      averageWaitTime: 0,
      maxWaitTime: 0,
      staffUtilization: {
        [StaffRole.DOCTOR]: 0,
        [StaffRole.NURSE]: 0,
        [StaffRole.RECEPTIONIST]: 0,
      },
      queueLength: 0,
      throughput: 0,
    };
  }

  public setArrivalRate(rate: number): void {
    this.arrivalRate = rate;
  }

  public setSimulationSpeed(speed: number): void {
    this.simulationSpeed = speed;
  }

  public addStaff(role: StaffRole, count: number = 1): void {
    for (let i = 0; i < count; i++) {
      this.staff.push(new Staff(role));
    }
  }

  public removeStaff(role: StaffRole): boolean {
    const index = this.staff.findIndex((s) => s.role === role && !s.isBusy());
    if (index !== -1) {
      this.staff.splice(index, 1);
      return true;
    }
    return false;
  }

  public start(): void {
    this.isRunning = true;
    this.lastTick = Date.now();
    this.tick();
  }

  public pause(): void {
    this.isRunning = false;
  }

  public reset(): void {
    this.patients = [];
    this.currentTime = 0;
    this.lastPatientId = 0;
    this.isRunning = false;
    this.stats = {
      totalPatients: 0,
      treatedPatients: 0,
      averageWaitTime: 0,
      maxWaitTime: 0,
      staffUtilization: {
        [StaffRole.DOCTOR]: 0,
        [StaffRole.NURSE]: 0,
        [StaffRole.RECEPTIONIST]: 0,
      },
      queueLength: 0,
      throughput: 0,
    };

    // Reset staff
    this.staff.forEach((staff) => staff.reset());
  }

  public getStats(): SimulationStats {
    return this.stats;
  }

  public getPatients(): Patient[] {
    return this.patients;
  }

  public getStaff(): Staff[] {
    return this.staff;
  }

  public manuallyAddPatient(priority: PatientPriority): void {
    this.addNewPatient(priority);
  }

  public onUpdate(callback: () => void): void {
    this.onUpdateCallback = callback;
  }

  private tick(): void {
    if (!this.isRunning) return;

    const now = Date.now();
    const deltaTime = ((now - this.lastTick) / 1000) * this.simulationSpeed; // Convert to seconds
    this.lastTick = now;

    // Update simulation time
    this.currentTime += deltaTime;

    // Generate new patients based on arrival rate
    this.generatePatients(deltaTime);

    // Process patients
    this.processPatients();

    // Update stats
    this.updateStats();

    // Call the update callback
    this.onUpdateCallback();

    // Schedule next tick
    requestAnimationFrame(() => this.tick());
  }

  private generatePatients(deltaTime: number): void {
    // Calculate probability of a new patient arriving in this time step
    const arrivalProbability =
      1 - Math.exp((-this.arrivalRate * deltaTime) / 3600);

    if (Math.random() < arrivalProbability) {
      // Determine priority based on random chance
      let priority: PatientPriority;
      const rand = Math.random();
      if (rand < 0.1) {
        priority = PatientPriority.CRITICAL;
      } else if (rand < 0.3) {
        priority = PatientPriority.URGENT;
      } else {
        priority = PatientPriority.STANDARD;
      }

      this.addNewPatient(priority);
    }
  }

  private addNewPatient(priority: PatientPriority): void {
    const newPatient = new Patient(
      ++this.lastPatientId,
      priority,
      this.currentTime
    );
    this.patients.push(newPatient);
    this.stats.totalPatients++;
  }

  private processPatients(): void {
    // Sort patients by priority and arrival time
    this.patients.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // Lower priority value means higher urgency
      }
      return a.arrivalTime - b.arrivalTime; // Earlier arrival gets served first within same priority
    });

    // Process patients based on their current state
    for (const patient of this.patients) {
      switch (patient.status) {
        case PatientStatus.WAITING:
          this.processWaitingPatient(patient);
          break;
        case PatientStatus.WITH_RECEPTIONIST:
          this.processPatientWithReceptionist(patient);
          break;
        case PatientStatus.WITH_NURSE:
          this.processPatientWithNurse(patient);
          break;
        case PatientStatus.WITH_DOCTOR:
          this.processPatientWithDoctor(patient);
          break;
        default:
          break;
      }
    }

    // Remove treated patients
    this.patients = this.patients.filter(
      (p) => p.status !== PatientStatus.TREATED
    );
  }

  private processWaitingPatient(patient: Patient): void {
    // Try to assign a receptionist
    const receptionist = this.findAvailableStaff(StaffRole.RECEPTIONIST);
    if (receptionist) {
      patient.status = PatientStatus.WITH_RECEPTIONIST;
      const processingTime = generateUniformTime(3, 7); // 3-7 minutes
      receptionist.assignPatient(patient, processingTime);
    }
  }

  private processPatientWithReceptionist(patient: Patient): void {
    // Check if receptionist is done
    const receptionist = this.findStaffWithPatient(patient.id);
    if (receptionist && receptionist.isDone(this.currentTime)) {
      receptionist.releasePatient();
      patient.status = PatientStatus.WAITING_FOR_NURSE;

      // Try to assign a nurse right away
      const nurse = this.findAvailableStaff(StaffRole.NURSE);
      if (nurse) {
        patient.status = PatientStatus.WITH_NURSE;
        const processingTime = generateUniformTime(5, 15); // 5-15 minutes
        nurse.assignPatient(patient, processingTime);
      }
    }
  }

  private processPatientWithNurse(patient: Patient): void {
    // Check if nurse is done
    const nurse = this.findStaffWithPatient(patient.id);
    if (nurse && nurse.isDone(this.currentTime)) {
      nurse.releasePatient();
      patient.status = PatientStatus.WAITING_FOR_DOCTOR;

      // Try to assign a doctor right away
      const doctor = this.findAvailableStaff(StaffRole.DOCTOR);
      if (doctor) {
        patient.status = PatientStatus.WITH_DOCTOR;
        // Critical patients need more time with doctors
        let processingTime;
        switch (patient.priority) {
          case PatientPriority.CRITICAL:
            processingTime = generateExponentialTime(30); // avg 30 minutes
            break;
          case PatientPriority.URGENT:
            processingTime = generateExponentialTime(20); // avg 20 minutes
            break;
          default:
            processingTime = generateExponentialTime(15); // avg 15 minutes
        }
        doctor.assignPatient(patient, processingTime);
      }
    }
  }

  private processPatientWithDoctor(patient: Patient): void {
    // Check if doctor is done
    const doctor = this.findStaffWithPatient(patient.id);
    if (doctor && doctor.isDone(this.currentTime)) {
      doctor.releasePatient();
      patient.status = PatientStatus.TREATED;
      patient.completionTime = this.currentTime;
      this.stats.treatedPatients++;

      // Calculate wait time
      const waitTime = patient.completionTime - patient.arrivalTime;
      const totalWaitTime =
        this.stats.averageWaitTime * (this.stats.treatedPatients - 1) +
        waitTime;
      this.stats.averageWaitTime = totalWaitTime / this.stats.treatedPatients;
      this.stats.maxWaitTime = Math.max(this.stats.maxWaitTime, waitTime);
    }
  }

  private findAvailableStaff(role: StaffRole): Staff | undefined {
    return this.staff.find((s) => s.role === role && !s.isBusy());
  }

  private findStaffWithPatient(patientId: number): Staff | undefined {
    return this.staff.find((s) => s.currentPatientId === patientId);
  }

  private updateStats(): void {
    // Calculate queue length
    this.stats.queueLength = this.patients.filter(
      (p) =>
        p.status === PatientStatus.WAITING ||
        p.status === PatientStatus.WAITING_FOR_NURSE ||
        p.status === PatientStatus.WAITING_FOR_DOCTOR
    ).length;

    // Calculate staff utilization
    const staffCounts = {
      [StaffRole.DOCTOR]: 0,
      [StaffRole.NURSE]: 0,
      [StaffRole.RECEPTIONIST]: 0,
    };

    const busyStaffCounts = {
      [StaffRole.DOCTOR]: 0,
      [StaffRole.NURSE]: 0,
      [StaffRole.RECEPTIONIST]: 0,
    };

    for (const staff of this.staff) {
      staffCounts[staff.role]++;
      if (staff.isBusy()) {
        busyStaffCounts[staff.role]++;
      }
    }

    for (const role of Object.values(StaffRole)) {
      this.stats.staffUtilization[role] =
        staffCounts[role] > 0 ? busyStaffCounts[role] / staffCounts[role] : 0;
    }

    // Calculate throughput (patients per hour)
    this.stats.throughput =
      this.currentTime > 0
        ? (this.stats.treatedPatients / this.currentTime) * 3600
        : 0;
  }
}
