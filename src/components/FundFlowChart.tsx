import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const data = [
  { month: 'Oct', incoming: 400000, conversion: 240000, deployed: 180000 },
  { month: 'Nov', incoming: 520000, conversion: 380000, deployed: 250000 },
  { month: 'Dec', incoming: 980000, conversion: 750000, deployed: 620000 },
  { month: 'Jan', incoming: 450000, conversion: 320000, deployed: 290000 },
  { month: 'Feb', incoming: 610000, conversion: 480000, deployed: 410000 },
  { month: 'Mar', incoming: 820000, conversion: 690000, deployed: 580000 },
  { month: 'Apr', incoming: 1200000, conversion: 950000, deployed: 880000 },
];

export const FundFlowChart: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full h-[400px] sm:h-[450px] relative bg-white/50 dark:bg-slate-800/50 rounded-xl">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm sm:flex">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{t('transparency.liveLedger')}</span>
      </div>
      <div className="w-full h-full p-2 sm:p-4 pt-14 sm:pt-12">
        <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FB923C" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#FB923C" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDeployed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
              backgroundColor: '#fff',
              fontSize: '11px',
              fontWeight: '700'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            align="center" 
            height={50}
            iconType="circle"
            layout="horizontal"
            wrapperStyle={{
              paddingTop: '20px'
            }}
            formatter={(value) => <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{value}</span>}
          />
          <Area 
            type="monotone" 
            dataKey="incoming" 
            name={t('transparency.chartIncoming')}
            stroke="#FB923C" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorIncoming)" 
          />
          <Area 
            type="monotone" 
            dataKey="conversion" 
            name={t('transparency.chartConversion')}
            stroke="#10B981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorConversion)" 
          />
          <Area 
            type="monotone" 
            dataKey="deployed" 
            name={t('transparency.chartDeployed')}
            stroke="#3B82F6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorDeployed)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);
};
