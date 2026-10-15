import React from 'react';

const StatCard = ({ title, value, icon, color, subtitle }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      valueColor: 'text-indigo-700',
      border: 'border-indigo-100',
    },
    yellow: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
      border: 'border-amber-100',
    },
    green: {
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
      border: 'border-emerald-100',
    },
    gray: {
      bg: 'bg-slate-50',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      valueColor: 'text-slate-700',
      border: 'border-slate-100',
    },
  };
  const c = colorMap[color] || colorMap.gray;

  return (
    <div className={`bg-white rounded-2xl border ${c.border} shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow`}>
      <div className={`w-12 h-12 rounded-xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
        <span className={c.iconColor}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.valueColor}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
