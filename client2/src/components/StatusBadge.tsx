import React from 'react';
import { TestStatus } from '../types';

interface Props {
  status: TestStatus | string;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'DRAFT':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: 'DRAFT',
          pulse: false,
        };
      case 'TESTING':
        return {
          bg: 'bg-purple-50 text-secondary border-purple-200',
          dot: 'bg-secondary',
          label: 'TESTING',
          pulse: true,
        };
      case 'SUBMITTED':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: 'SUBMITTED',
          pulse: false,
        };
      case 'UNDER_REVIEW':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-600',
          label: 'UNDER REVIEW',
          pulse: false,
        };
      case 'APPROVED':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600',
          label: 'APPROVED',
          pulse: false,
        };
      case 'REPORT_GENERATED':
        return {
          bg: 'bg-blue-50 text-primary border-blue-200',
          dot: 'bg-primary',
          label: 'REPORT ISSUED',
          pulse: false,
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-600',
          label: 'REJECTED',
          pulse: false,
        };
      case 'ARCHIVED':
        return {
          bg: 'bg-gray-100 text-gray-700 border-gray-200',
          dot: 'bg-gray-400',
          label: 'ARCHIVED',
          pulse: false,
        };
      default:
        return {
          bg: 'bg-surface-container text-on-surface-variant border-outline-variant',
          dot: 'bg-outline',
          label: status,
          pulse: false,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-caps text-[11px] font-semibold border ${config.bg}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} ${config.pulse ? 'animate-ping' : ''}`}
      />
      {config.label}
    </span>
  );
};
