import React from 'react';
import { TestResult } from '../types';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Props {
  result: TestResult | string;
  size?: 'sm' | 'md' | 'lg';
}

export const ComplianceBadge: React.FC<Props> = ({ result, size = 'sm' }) => {
  const getStyle = () => {
    switch (result) {
      case 'PASS':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-600/20';
      case 'FAIL':
        return 'bg-rose-50 text-rose-800 border-rose-300 ring-rose-600/20';
      case 'INCOMPLETE':
        return 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-600/20';
      default:
        return 'bg-surface-container text-on-surface-variant border-surface-variant ring-outline/10';
    }
  };

  const getIcon = () => {
    const iconSize = size === 'lg' ? 18 : size === 'md' ? 15 : 13;
    switch (result) {
      case 'PASS':
        return <CheckCircle2 size={iconSize} className="text-emerald-600 mr-1.5 flex-shrink-0" />;
      case 'FAIL':
        return <XCircle size={iconSize} className="text-rose-600 mr-1.5 flex-shrink-0" />;
      case 'INCOMPLETE':
        return <AlertCircle size={iconSize} className="text-amber-600 mr-1.5 flex-shrink-0" />;
      default:
        return <Clock size={iconSize} className="text-on-surface-variant mr-1.5 flex-shrink-0" />;
    }
  };

  const textClasses =
    size === 'lg'
      ? 'text-sm px-3.5 py-1 font-bold'
      : size === 'md'
      ? 'text-xs px-2.5 py-0.5 font-semibold'
      : 'font-label-caps text-[11px] px-2 py-0.5 font-bold uppercase tracking-wider';

  return (
    <span
      className={`inline-flex items-center rounded border ring-1 ring-inset ${textClasses} ${getStyle()}`}
    >
      {getIcon()}
      {result}
    </span>
  );
};
