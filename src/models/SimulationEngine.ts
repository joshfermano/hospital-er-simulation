import { Patient, PatientPriority, PatientStatus } from './Patient';
import { Staff, StaffRole } from './Staff';
import {
  generateExponentialTime,
  generatePoissonRandom,
  weightedCoinToss,
} from '../utils/random';

export interface SimulationStats {
  totalPatients: number;
  treatedPatients: number;
  averageWaitTime: number;
  maxWaitTime: number;
  queueLength: number;
  throughput: number;
  staffUtilization: Record<StaffRole, number>;
}

type UpdateCallback = () => void;

export class SimulationEngine {
  private patients: Patient[] = [];
  private staff: Staff[] = [];
  private lastPatientId = 0;
  private arrivalRate = 10; // patients per hour
  private simulationSpeed = 1;
  private intervalId: number | null = null;
  private updateCallbacks: UpdateCallback[] = [];
  private startTime: number = Date.now() / 1000;
  private currentTime: number = this.startTime;
  private lastUpdateTime: number = this.startTime;
  private stats: SimulationStats = {
    totalPatients: 0,
    treatedPatients: 0,
    averageWaitTime: 0,
    maxWaitTime: 0,
    queueLength: 0,
    throughput: 0,
    staffUtilization: {
      [StaffRole.DOCTOR]: 0,
      [StaffRole.NURSE]: 0,
      [StaffRole.RECEPTIONIST]: 0,
    },
  };

  constructor() {
    // Initialize with empty state
  }

  public start(): void {
    if (this.intervalId !== null) return;

    this.lastUpdateTime = Date.now() / 1000;
    this.intervalId = window.setInterval(
      () => this.update(),
      1000 / this.simulationSpeed
    );
  }

  public pause(): void {
    if (this.intervalId === null) return;

    window.clearInterval(this.intervalId);
    this.intervalId = null;
  }

  public reset(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.patients = [];
    this.staff = [];
    this.lastPatientId = 0;
    this.startTime = Date.now() / 1000;
    this.currentTime = this.startTime;
    this.lastUpdateTime = this.startTime;
    this.stats = {
      totalPatients: 0,
      treatedPatients: 0,
      averageWaitTime: 0,
      maxWaitTime: 0,
      queueLength: 0,
      throughput: 0,
      staffUtilization: {
        [StaffRole.DOCTOR]: 0,
        [StaffRole.NURSE]: 0,
        [StaffRole.RECEPTIONIST]: 0,
      },
    };

    // Notify all listeners
    this.notifyListeners();
  }

  public setArrivalRate(rate: number): void {
    this.arrivalRate = rate;
  }

  public setSimulationSpeed(speed: number): void {
    this.simulationSpeed = speed;

    // Restart the timer with new speed if running
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = window.setInterval(
        () => this.update(),
        1000 / this.simulationSpeed
      );
    }
  }

  public addStaff(role: StaffRole, count: number = 1): void {
    console.log(`Adding ${count} staff with role ${role}`);
    for (let i = 0; i < count; i++) {
      const newStaff = new Staff(role);
      this.staff.push(newStaff);
    }

    // Update staff utilization after adding new staff
    this.updateStaffUtilization();
    this.notifyListeners();
  }

  public removeStaff(role: StaffRole): boolean {
    // Find staff member with the specified role who is not busy
    const index = this.staff.findIndex((s) => s.role === role && !s.isBusy());

    if (index >= 0) {
      this.staff.splice(index, 1);
      this.notifyListeners();
      return true;
    }

    return false;
  }

  public manuallyAddPatient(priority: PatientPriority): void {
    this.addNewPatient(priority);
    this.notifyListeners();
  }

  public onUpdate(callback: UpdateCallback): void {
    this.updateCallbacks.push(callback);
  }

  public getPatients(): Patient[] {
    return this.patients;
  }

  public getStaff(): Staff[] {
    return this.staff;
  }

  public getStats(): SimulationStats {
    return this.stats;
  }

  private update(): void {
    const now = Date.now() / 1000;
    const elapsed = now - this.lastUpdateTime;

    this.currentTime = now;
    this.lastUpdateTime = now;

    console.log(
      `Update called, elapsed time: ${elapsed.toFixed(2)}s, simulation speed: ${
        this.simulationSpeed
      }`
    );

    const arrivalRatePerSecond = this.arrivalRate / 3600;
    const expectedArrivals =
      arrivalRatePerSecond * elapsed * this.simulationSpeed;

    const actualArrivals = generatePoissonRandom(expectedArrivals);

    if (actualArrivals > 0) {
      console.log(
        `Generating ${actualArrivals} new patients (expected arrivals: ${expectedArrivals.toFixed(
          2
        )})`
      );
    }

    for (let i = 0; i < actualArrivals; i++) {
      this.generateRandomPatient();
    }

    this.processPatients();

    this.updateStats();

    this.notifyListeners();
  }

  private generateRandomPatient(): void {
    let priority: PatientPriority;
    const rand = Math.random();

    if (rand < 0.1) {
      priority = PatientPriority.CRITICAL;
    } else if (rand < 0.4) {
      priority = PatientPriority.URGENT;
    } else {
      priority = PatientPriority.STANDARD;
    }

    this.addNewPatient(priority);
  }

  private addNewPatient(priority: PatientPriority): void {
    const patientId = ++this.lastPatientId;
    const patient = new Patient(patientId, priority, this.currentTime);
    this.patients.push(patient);
    this.stats.totalPatients++;
  }

  private processPatients(): void {
    // Log the current state of  in the system
    const waitingCount = this.patients.filter(
      (p) => p.status === PatientStatus.WAITING
    ).length;
    const inRegistrationCount = this.patients.filter(
      (p) => p.status === PatientStatus.WITH_RECEPTIONIST
    ).length;
    const waitingForNurseCount = this.patients.filter(
      (p) => p.status === PatientStatus.WAITING_FOR_NURSE
    ).length;
    const withNurseCount = this.patients.filter(
      (p) => p.status === PatientStatus.WITH_NURSE
    ).length;
    const waitingForDoctorCount = this.patients.filter(
      (p) => p.status === PatientStatus.WAITING_FOR_DOCTOR
    ).length;
    const withDoctorCount = this.patients.filter(
      (p) => p.status === PatientStatus.WITH_DOCTOR
    ).length;
    const treatedCount = this.patients.filter(
      (p) => p.status === PatientStatus.TREATED
    ).length;

    console.log(
      `Processing patients: waiting=${waitingCount}, in-registration=${inRegistrationCount}, ` +
        `waiting-for-nurse=${waitingForNurseCount}, with-nurse=${withNurseCount}, ` +
        `waiting-for-doctor=${waitingForDoctorCount}, with-doctor=${withDoctorCount}, ` +
        `treated=${treatedCount}`
    );

    // First, check for staff that have finished with their patients
    console.log('Step 1: Releasing finished staff');
    this.releaseFinishedStaff();

    // Process patients in order of treatment flow (registration → nurse → doctor)
    console.log('Step 2: Processing waiting patients');
    this.processWaitingPatients(); // Assign waiting patients to receptionists

    console.log('Step 3: Processing registered patients');
    this.processRegisteredPatients(); // Assign patients waiting for nurse to nurses

    console.log('Step 4: Processing nurse patients');
    this.processNursePatients(); // Assign patients waiting for doctor to doctors

    console.log('Step 5: Processing treated patients');
    this.removeTreatedPatients(); // Clean up treated patients list if needed
  }

  private releaseFinishedStaff(): void {
    const currentTime = this.currentTime;
    let staffReleased = false;

    // Log current time and staff status
    console.log(
      `Current time: ${new Date(currentTime * 1000).toLocaleTimeString()}`
    );

    // Check all staff members
    for (const staffMember of this.staff) {
      // Check if staff member is DONE
      if (
        staffMember.currentPatientId !== null &&
        currentTime >= staffMember.busyUntil
      ) {
        const patientId = staffMember.currentPatientId;
        const patient = this.findPatientById(patientId);

        if (patient) {
          console.log(
            `Staff ${staffMember.id} (${staffMember.role}) completed processing patient ${patientId}`
          );

          // Process the patient based on their current status
          if (patient.status === PatientStatus.WITH_RECEPTIONIST) {
            patient.status = PatientStatus.WAITING_FOR_NURSE;
            console.log(
              `Patient ${patient.id} finished registration, now waiting for nurse`
            );
          } else if (patient.status === PatientStatus.WITH_NURSE) {
            patient.status = PatientStatus.WAITING_FOR_DOCTOR;
            console.log(
              `Patient ${patient.id} finished with nurse, now waiting for doctor`
            );
          } else if (patient.status === PatientStatus.WITH_DOCTOR) {
            // Patient completed treatment
            patient.status = PatientStatus.TREATED;
            patient.completionTime = this.currentTime;
            console.log(`Patient ${patient.id} finished treatment with doctor`);

            // Update treatment statistics
            const waitTime = patient.completionTime - patient.arrivalTime;

            // Update average wait time
            if (this.stats.treatedPatients === 0) {
              this.stats.averageWaitTime = waitTime;
            } else {
              // Use running average formula
              this.stats.averageWaitTime =
                (this.stats.averageWaitTime * this.stats.treatedPatients +
                  waitTime) /
                (this.stats.treatedPatients + 1);
            }

            // Update max wait time
            if (waitTime > this.stats.maxWaitTime) {
              this.stats.maxWaitTime = waitTime;
            }

            this.stats.treatedPatients++;
            console.log(
              `Updated treated patients count: ${this.stats.treatedPatients}`
            );
            console.log(
              `Updated average wait time: ${
                this.stats.averageWaitTime / 60
              } minutes`
            );
          }
        } else {
          console.warn(
            `Staff ${staffMember.id} has patientId ${patientId} but patient not found`
          );
        }

        // Release the staff member
        staffMember.releasePatient();
        staffReleased = true;
      }
    }

    if (staffReleased) {
      // If we released any staff, immediately update stats
      this.updateStats();
    }
  }

  private processWaitingPatients(): void {
    // Find patients waiting for registration
    const waitingPatients = this.patients.filter(
      (p) => p.status === PatientStatus.WAITING
    );

    if (waitingPatients.length > 0) {
      console.log(
        `Found ${waitingPatients.length} patients waiting for registration`
      );

      // Sort waiting patients by priority (CRITICAL first, then URGENT, then STANDARD)
      // and then by arrival time (earlier arrivals first)
      waitingPatients.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return a.arrivalTime - b.arrivalTime;
      });

      // Find available receptionists (using simulation time)
      const availableReceptionists = this.staff.filter(
        (s) =>
          s.role === StaffRole.RECEPTIONIST &&
          (s.currentPatientId === null || this.currentTime >= s.busyUntil)
      );

      // Release any receptionists that are done but still have patients
      for (const receptionist of availableReceptionists) {
        if (receptionist.currentPatientId !== null) {
          receptionist.releasePatient();
        }
      }

      console.log(
        `Found ${availableReceptionists.length} available receptionists (${
          this.staff.filter((s) => s.role === StaffRole.RECEPTIONIST).length
        } total)`
      );

      // Assign patients to available receptionists
      for (
        let i = 0;
        i < Math.min(waitingPatients.length, availableReceptionists.length);
        i++
      ) {
        const patient = waitingPatients[i];
        const receptionist = availableReceptionists[i];

        // Registration takes between 2-5 minutes, scaled by priority
        let registrationTime = 0;
        switch (patient.priority) {
          case PatientPriority.CRITICAL:
            registrationTime = 2 + Math.random() * 1; // 2-3 minutes
            break;
          case PatientPriority.URGENT:
            registrationTime = 3 + Math.random() * 1; // 3-4 minutes
            break;
          case PatientPriority.STANDARD:
            registrationTime = 4 + Math.random() * 1; // 4-5 minutes
            break;
        }

        // Update patient's status
        patient.status = PatientStatus.WITH_RECEPTIONIST;

        // Assign patient to receptionist with the calculated processing time
        // Use the simulation's current time for consistency
        const processingTimeSeconds = registrationTime * 60;
        receptionist.currentPatientId = patient.id;
        receptionist.busyUntil = this.currentTime + processingTimeSeconds;

        console.log(
          `Assigned patient ${
            patient.id
          } (${patient.getPriorityText()}) to receptionist ${
            receptionist.id
          } for ${registrationTime.toFixed(1)} minutes until ${new Date(
            (this.currentTime + processingTimeSeconds) * 1000
          ).toTimeString()}`
        );
      }
    }
  }

  private processRegisteredPatients(): void {
    // Find patients waiting for nurse
    const waitingForNursePatients = this.patients.filter(
      (p) => p.status === PatientStatus.WAITING_FOR_NURSE
    );

    // Log the number of patients waiting for nurse
    console.log(
      `Found ${waitingForNursePatients.length} patients waiting for nurse`
    );

    // Sort by priority first, then by arrival time
    waitingForNursePatients.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.arrivalTime - b.arrivalTime;
    });

    // Find available nurses
    const availableNurses = this.staff.filter(
      (s) =>
        s.role === StaffRole.NURSE &&
        // Check directly against currentTime and busyUntil instead of using isBusy()
        (s.currentPatientId === null || this.currentTime >= s.busyUntil)
    );

    // Log the number of available nurses
    console.log(
      `Found ${availableNurses.length} available nurses (${
        this.staff.filter((s) => s.role === StaffRole.NURSE).length
      } total nurses)`
    );

    // Release any nurses that are done
    for (const nurse of availableNurses) {
      if (nurse.currentPatientId !== null) {
        nurse.releasePatient();
      }
    }

    // Assign patients to available nurses
    for (
      let i = 0;
      i < Math.min(waitingForNursePatients.length, availableNurses.length);
      i++
    ) {
      const patient = waitingForNursePatients[i];
      const nurse = availableNurses[i];

      // Nurse assessment takes between 5-15 minutes depending on priority
      let nurseTime = 0;
      switch (patient.priority) {
        case PatientPriority.CRITICAL:
          nurseTime = 5 + Math.random() * 5; // 5-10 minutes
          break;
        case PatientPriority.URGENT:
          nurseTime = 7 + Math.random() * 5; // 7-12 minutes
          break;
        case PatientPriority.STANDARD:
          nurseTime = 10 + Math.random() * 5; // 10-15 minutes
          break;
      }

      patient.status = PatientStatus.WITH_NURSE;

      // Use the simulation's current time for consistency
      const processingTimeSeconds = nurseTime * 60;
      nurse.currentPatientId = patient.id;
      nurse.busyUntil = this.currentTime + processingTimeSeconds;

      console.log(
        `Assigned patient ${
          patient.id
        } (${patient.getPriorityText()}) to nurse ${
          nurse.id
        } for ${nurseTime.toFixed(1)} minutes until ${new Date(
          (this.currentTime + processingTimeSeconds) * 1000
        ).toTimeString()}`
      );
    }
  }

  private processNursePatients(): void {
    // Find patients waiting for doctor
    const waitingForDoctorPatients = this.patients.filter(
      (p) => p.status === PatientStatus.WAITING_FOR_DOCTOR
    );

    // Log the number of patients waiting for doctor
    console.log(
      `Found ${waitingForDoctorPatients.length} patients waiting for doctor`
    );

    // Sort by priority first, then arrival time
    waitingForDoctorPatients.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.arrivalTime - b.arrivalTime;
    });

    // Find available doctors
    const availableDoctors = this.staff.filter(
      (s) =>
        s.role === StaffRole.DOCTOR &&
        // Check directly against currentTime and busyUntil instead of using isBusy()
        (s.currentPatientId === null || this.currentTime >= s.busyUntil)
    );

    // Log the number of available doctors
    console.log(
      `Found ${availableDoctors.length} available doctors (${
        this.staff.filter((s) => s.role === StaffRole.DOCTOR).length
      } total doctors)`
    );

    // Release any doctors that are done
    for (const doctor of availableDoctors) {
      if (doctor.currentPatientId !== null) {
        doctor.releasePatient();
      }
    }

    // Assign patients to available doctors
    for (
      let i = 0;
      i < Math.min(waitingForDoctorPatients.length, availableDoctors.length);
      i++
    ) {
      const patient = waitingForDoctorPatients[i];
      const doctor = availableDoctors[i];

      // Doctor treatment takes between 10-60 minutes depending on priority
      let doctorTime = 0;
      switch (patient.priority) {
        case PatientPriority.CRITICAL:
          doctorTime = 20 + Math.random() * 40; // 20-60 minutes
          break;
        case PatientPriority.URGENT:
          doctorTime = 15 + Math.random() * 25; // 15-40 minutes
          break;
        case PatientPriority.STANDARD:
          doctorTime = 10 + Math.random() * 20; // 10-30 minutes
          break;
      }

      patient.status = PatientStatus.WITH_DOCTOR;

      // Use the simulation's current time for consistency
      const processingTimeSeconds = doctorTime * 60;
      doctor.currentPatientId = patient.id;
      doctor.busyUntil = this.currentTime + processingTimeSeconds;

      console.log(
        `Assigned patient ${
          patient.id
        } (${patient.getPriorityText()}) to doctor ${
          doctor.id
        } for ${doctorTime.toFixed(1)} minutes until ${new Date(
          (this.currentTime + processingTimeSeconds) * 1000
        ).toTimeString()}`
      );
    }
  }

  private processDoctorPatients(): void {
    // This function can be used to process post-doctor actions
    // Already handled in releaseFinishedStaff
  }

  private removeTreatedPatients(): void {
    // Optionally remove treated patients from the list
    // For stats purposes, we're keeping them around (let's limit to the last 100)
    const treatedPatients = this.patients.filter(
      (p) => p.status === PatientStatus.TREATED
    );

    if (treatedPatients.length > 100) {
      const excessCount = treatedPatients.length - 100;
      // Sort by completion time and remove oldest
      treatedPatients.sort(
        (a, b) =>
          (a.completionTime || Infinity) - (b.completionTime || Infinity)
      );

      for (let i = 0; i < excessCount; i++) {
        const patientId = treatedPatients[i].id;
        const patientIndex = this.patients.findIndex((p) => p.id === patientId);
        if (patientIndex >= 0) {
          this.patients.splice(patientIndex, 1);
        }
      }
    }
  }

  private updateStats(): void {
    // Update queue length
    this.stats.queueLength = this.patients.filter(
      (p) =>
        p.status === PatientStatus.WAITING ||
        p.status === PatientStatus.WAITING_FOR_NURSE ||
        p.status === PatientStatus.WAITING_FOR_DOCTOR
    ).length;

    // Update throughput (patients per hour)
    const elapsedHours = (this.currentTime - this.startTime) / 3600;
    if (elapsedHours > 0) {
      this.stats.throughput = this.stats.treatedPatients / elapsedHours;
    }

    // Update staff utilization
    this.updateStaffUtilization();
  }

  private updateStaffUtilization(): void {
    // Calculate utilization for each role
    const roleKeys = [
      StaffRole.DOCTOR,
      StaffRole.NURSE,
      StaffRole.RECEPTIONIST,
    ];

    for (const role of roleKeys) {
      const staffOfType = this.staff.filter((s) => s.role === role);

      if (staffOfType.length > 0) {
        const busyStaff = staffOfType.filter((s) => s.isBusy()).length;
        this.stats.staffUtilization[role] = busyStaff / staffOfType.length;

        // Debug logging to help diagnose issues
        console.log(
          `Staff utilization for ${role}: ${busyStaff}/${staffOfType.length} = ${this.stats.staffUtilization[role]}`
        );
      } else {
        this.stats.staffUtilization[role] = 0;
      }
    }
  }

  private findStaffWithPatient(patientId: number): Staff | undefined {
    return this.staff.find((s) => s.currentPatientId === patientId);
  }

  private findPatientById(id: number): Patient | undefined {
    return this.patients.find((p) => p.id === id);
  }

  private notifyListeners(): void {
    for (const callback of this.updateCallbacks) {
      callback();
    }
  }
}
