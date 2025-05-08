import React from 'react';
import { Staff, StaffRole } from '../models/Staff';

interface StaffManagementProps {
  staff: Staff[];
  addStaff: (role: StaffRole) => void;
  removeStaff: (role: StaffRole) => boolean;
}

const StaffManagement: React.FC<StaffManagementProps> = ({
  staff,
  addStaff,
  removeStaff,
}) => {
  const staffCounts = {
    [StaffRole.DOCTOR]: staff.filter((s) => s.role === StaffRole.DOCTOR).length,
    [StaffRole.NURSE]: staff.filter((s) => s.role === StaffRole.NURSE).length,
    [StaffRole.RECEPTIONIST]: staff.filter(
      (s) => s.role === StaffRole.RECEPTIONIST
    ).length,
  };

  const busyStaffCounts = {
    [StaffRole.DOCTOR]: staff.filter(
      (s) => s.role === StaffRole.DOCTOR && s.isBusy()
    ).length,
    [StaffRole.NURSE]: staff.filter(
      (s) => s.role === StaffRole.NURSE && s.isBusy()
    ).length,
    [StaffRole.RECEPTIONIST]: staff.filter(
      (s) => s.role === StaffRole.RECEPTIONIST && s.isBusy()
    ).length,
  };

  const handleRemoveStaff = (role: StaffRole) => {
    const result = removeStaff(role);
    if (!result) {
      alert(
        `Cannot remove busy ${role.toLowerCase()} or no ${role.toLowerCase()} available.`
      );
    }
  };

  return (
    <div className="space-y-3">
      <StaffTypeRow
        role={StaffRole.DOCTOR}
        total={staffCounts[StaffRole.DOCTOR]}
        busy={busyStaffCounts[StaffRole.DOCTOR]}
        onAdd={() => addStaff(StaffRole.DOCTOR)}
        onRemove={() => handleRemoveStaff(StaffRole.DOCTOR)}
      />
      <StaffTypeRow
        role={StaffRole.NURSE}
        total={staffCounts[StaffRole.NURSE]}
        busy={busyStaffCounts[StaffRole.NURSE]}
        onAdd={() => addStaff(StaffRole.NURSE)}
        onRemove={() => handleRemoveStaff(StaffRole.NURSE)}
      />
      <StaffTypeRow
        role={StaffRole.RECEPTIONIST}
        total={staffCounts[StaffRole.RECEPTIONIST]}
        busy={busyStaffCounts[StaffRole.RECEPTIONIST]}
        onAdd={() => addStaff(StaffRole.RECEPTIONIST)}
        onRemove={() => handleRemoveStaff(StaffRole.RECEPTIONIST)}
      />
    </div>
  );
};

interface StaffTypeRowProps {
  role: StaffRole;
  total: number;
  busy: number;
  onAdd: () => void;
  onRemove: () => void;
}

const StaffTypeRow: React.FC<StaffTypeRowProps> = ({
  role,
  total,
  busy,
  onAdd,
  onRemove,
}) => {
  const roleName = role.charAt(0) + role.slice(1).toLowerCase() + 's';

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-3">
      <div className="flex justify-between items-center">
        <div className="text-stone-800 font-medium text-sm">{roleName}</div>
        <div className="flex gap-1">
          <button
            onClick={onAdd}
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-1 rounded-md text-xs border border-stone-200">
            +
          </button>
          <button
            onClick={onRemove}
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-1 rounded-md text-xs border border-stone-200">
            −
          </button>
        </div>
      </div>
      <div className="mt-2 text-xs flex justify-between text-stone-600">
        <div>
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1.5"></span>
          <span className="font-medium">{total - busy}</span> Available
        </div>
        <div>
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5"></span>
          <span className="font-medium">{busy}</span> Busy
        </div>
        <div>
          <span className="inline-block w-2 h-2 rounded-full bg-stone-400 mr-1.5"></span>
          <span className="font-medium">{total}</span> Total
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
