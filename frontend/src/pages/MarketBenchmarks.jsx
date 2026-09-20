import React, { useState, useEffect } from 'react';
import {
  Globe2,
  TrendingUp,
  Building,
  Shield,
  Activity,
  DollarSign,
  BarChart2,
} from 'lucide-react';
import { marketAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/MetricCard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const MarketBenchmarks = () => {
  const { formatCurrency, activeOrg } = useAuth();
  const [industry, setIndustry] = useState('BFSI');
  const [benchmarks, setBenchmarks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenchmarks = async () => {
      setLoading(true);
      try {
        const res = await marketAPI.getBenchmarks(industry);
        setBenchmarks(res.data);
      } catch (err) {
        console.error('Failed to load benchmarks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBenchmarks();
  }, [industry]);

  const sectors = ['BFSI', 'HEALTHCARE', 'TECHNOLOGY', 'MANUFACTURING', 'RETAIL'];

  const comparisonData = [
    {
      metric: 'Annual Security Spend (% of IT)',
      Org: 11.4,
      IndustryPeer: 8.6,
    },
    {
      metric: 'Mean Time to Detect (MTTD hrs)',
      Org: 4.2,
      IndustryPeer: 18.5,
    },
    {
      metric: 'Mean Time to Remediate (MTTR hrs)',
      Org: 12.0,
      IndustryPeer: 48.0,
    },
    {
      metric: 'Phishing Simulation Failure %',
      Org: 3.1,
      IndustryPeer: 9.8,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-mono font-bold text-white tracking-tight flex items-center gap-2.5">
          <Globe2 className="w-6 h-6 text-emerald-400" />
          Market Intelligence & Industry Benchmarking
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Comparative cyber risk posture and security spending against sector peer baselines.
        </p>
      </div>

      {/* Sector Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => setIndustry(s)}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              industry === s
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(0,229,153,0.3)]'
                : 'bg-[#060b0e] border border-[#18262a] text-slate-400 hover:text-slate-200'
            }`}
          >
            {s} SECTOR
          </button>
        ))}
      </div>

      {/* KPI Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Industry Average Breach Loss"
          value={formatCurrency(benchmarks?.average_breach_loss || 4450000)}
          subtitle={`Average per incident in ${industry}`}
          icon={DollarSign}
          variant="rose"
          trend="Global Ponemon Index"
        />
        <MetricCard
          title="Organization Cyber Posture"
          value="TOP 15%"
          subtitle="Outperforming peer group resilience"
          icon={Shield}
          variant="emerald"
          badge="TIER 1 RESILIENT"
        />
        <MetricCard
          title="Average Incident MTTD"
          value="4.2 Hours"
          subtitle={`vs ${benchmarks?.average_mttd_hours || 24} hrs industry benchmark`}
          icon={Activity}
          variant="emerald"
          trend="-82% Faster"
        />
      </div>

      {/* Comparative Bar Chart */}
      <div className="bg-[#060b0e] border border-[#18262a] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 border-b border-[#18262a] pb-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            Operational Metrics: {activeOrg?.name || 'Your Organization'} vs {industry} Sector
          </div>
          <span className="text-[10px] font-mono text-emerald-400">FAIR PEER DATA</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#18262a" />
              <XAxis
                dataKey="metric"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10 }}
              />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
              <Bar dataKey="Org" name="Your Organization" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="IndustryPeer" name={`${industry} Peer Baseline`} fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MarketBenchmarks;


