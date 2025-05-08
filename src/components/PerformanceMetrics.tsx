import React from 'react';
import type { SimulationStats } from '../models/SimulationEngine';
import { formatTime, formatPercentage } from '../utils/statistics';
import { StaffRole } from '../models/Staff';

interface PerformanceMetricsProps {
  stats: SimulationStats;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          title="Total Patients"
          value={stats.totalPatients.toString()}
          icon="👥"
        />
        <MetricCard
          title="Treated Patients"
          value={stats.treatedPatients.toString()}
          icon="✅"
        />
        <MetricCard
          title="Average Wait Time"
          value={formatTime(stats.averageWaitTime / 60)}
          icon="⏱️"
        />
        <MetricCard
          title="Current Queue Length"
          value={stats.queueLength.toString()}
          icon="🧍"
        />
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-medium mb-3 text-stone-700">
          Staff Utilization
        </h3>
        <div className="space-y-4">
          <UtilizationBar
            label="Doctors"
            percentage={stats.staffUtilization[StaffRole.DOCTOR]}
            color="bg-stone-700"
          />
          <UtilizationBar
            label="Nurses"
            percentage={stats.staffUtilization[StaffRole.NURSE]}
            color="bg-stone-600"
          />
          <UtilizationBar
            label="Receptionists"
            percentage={stats.staffUtilization[StaffRole.RECEPTIONIST]}
            color="bg-stone-500"
          />
        </div>
      </div>

      <div className="mt-2 border-t border-stone-100 pt-4">
        <p className="text-xs text-stone-500 flex justify-between py-1">
          <span>Throughput</span>
          <span className="font-medium">
            {stats.throughput.toFixed(2)} patients/hour
          </span>
        </p>
        <p className="text-xs text-stone-500 flex justify-between py-1">
          <span>Max Wait Time</span>
          <span className="font-medium">
            {formatTime(stats.maxWaitTime / 60)}
          </span>
        </p>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-stone-100 border border-stone-200 rounded-lg p-3">
      <div className="flex justify-between items-center">
        <span className="text-xs text-stone-600">{title}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-xl font-medium mt-1 text-stone-800">{value}</div>
    </div>
  );
};

interface UtilizationBarProps {
  label: string;
  percentage: number;
  color: string;
}

const UtilizationBar: React.FC<UtilizationBarProps> = ({
  label,
  percentage,
  color,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-1.5">
        <span className="text-stone-700">{label}</span>
        <span className="font-medium text-stone-800">
          {formatPercentage(percentage)}
        </span>
      </div>
      <div className="w-full bg-stone-200 rounded-full h-1.5">
        <div
          className={`${color} h-1.5 rounded-full`}
          style={{ width: `${percentage * 100}%` }}></div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
