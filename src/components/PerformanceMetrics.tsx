import React, { useEffect } from 'react';
import type { SimulationStats } from '../models/SimulationEngine';
import { formatTime, formatPercentage } from '../utils/statistics';

interface PerformanceMetricsProps {
  stats: SimulationStats;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ stats }) => {
  // Debug log when stats change
  useEffect(() => {
    console.log('PerformanceMetrics received stats update:', {
      totalPatients: stats.totalPatients,
      treatedPatients: stats.treatedPatients,
      averageWaitTime: stats.averageWaitTime,
      staffUtilization: stats.staffUtilization,
    });
  }, [stats]);

  const averageWaitTimeFormatted = React.useMemo(() => {
    return stats.averageWaitTime > 0
      ? formatTime(stats.averageWaitTime / 60)
      : '0m';
  }, [stats.averageWaitTime]);

  const maxWaitTimeFormatted = React.useMemo(() => {
    return stats.maxWaitTime > 0 ? formatTime(stats.maxWaitTime / 60) : '0s';
  }, [stats.maxWaitTime]);

  const throughputFormatted = React.useMemo(() => {
    return `${stats.throughput.toFixed(2)} patients/hour`;
  }, [stats.throughput]);

  // Get utilization percentages with fallbacks for undefined values
  const doctorUtilization =
    typeof stats.staffUtilization.DOCTOR === 'number'
      ? stats.staffUtilization.DOCTOR
      : 0;

  const nurseUtilization =
    typeof stats.staffUtilization.NURSE === 'number'
      ? stats.staffUtilization.NURSE
      : 0;

  const receptionistUtilization =
    typeof stats.staffUtilization.RECEPTIONIST === 'number'
      ? stats.staffUtilization.RECEPTIONIST
      : 0;

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
          value={averageWaitTimeFormatted}
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
            percentage={doctorUtilization}
            color="bg-stone-700"
          />
          <UtilizationBar
            label="Nurses"
            percentage={nurseUtilization}
            color="bg-stone-600"
          />
          <UtilizationBar
            label="Receptionists"
            percentage={receptionistUtilization}
            color="bg-stone-500"
          />
        </div>
      </div>

      <div className="mt-2 border-t border-stone-100 pt-4">
        <p className="text-xs text-stone-500 flex justify-between py-1">
          <span>Throughput</span>
          <span className="font-medium">{throughputFormatted}</span>
        </p>
        <p className="text-xs text-stone-500 flex justify-between py-1">
          <span>Max Wait Time</span>
          <span className="font-medium">{maxWaitTimeFormatted}</span>
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
  // Ensure percentage is a valid number
  const safePercentage = isNaN(percentage) ? 0 : percentage;

  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-1.5">
        <span className="text-stone-700">{label}</span>
        <span className="font-medium text-stone-800">
          {formatPercentage(safePercentage)}
        </span>
      </div>
      <div className="w-full bg-stone-200 rounded-full h-1.5">
        <div
          className={`${color} h-1.5 rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${Math.max(safePercentage * 100, 0.5)}%` }}></div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
