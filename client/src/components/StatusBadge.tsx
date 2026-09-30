import React from 'react';
import { TestStatus } from '../types';

interface Props {
  status: TestStatus | string;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'TESTING':
        return 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse';
      case 'SUBMITTED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'UNDER_REVIEW':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'REPORT_GENERATED':
        return 'bg-teal-50 text-teal-700 border-teal-300';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'REPORT_GENERATED':
        return 'REPORT ISSUED';
      case 'UNDER_REVIEW':
        return 'UNDER REVIEW';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}
    >
      {getLabel()}
    </span>
  );
};
