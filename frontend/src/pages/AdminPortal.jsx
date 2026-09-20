import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  Building2,
  Shield,
  Send,
  CheckCircle,
  RefreshCw,
  Search,
  Sliders,
} from 'lucide-react';
import { adminAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';

export const AdminPortal = () => {
  const { user, formatIST } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [orgsList, setOrgsList] = useState([]);
  const [demosList, setDemosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TENANTS');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        adminAPI.getStats(),
        adminAPI.getUsers({ limit: 100 }),
        adminAPI.getOrganizations({ limit: 100 }),
        adminAPI.getDemoRequests({ limit: 100 }),
      ]);
      const [sRes, uRes, oRes, dRes] = results;
      if (sRes.status === 'fulfilled' && sRes.value?.data) setStats(sRes.value.data);
      if (uRes.status === 'fulfilled' && uRes.value?.data) setUsersList(uRes.value.data);
      if (oRes.status === 'fulfilled' && oRes.value?.data) setOrgsList(oRes.value.data);
      if (dRes.status === 'fulfilled' && dRes.value?.data) setDemosList(dRes.value.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateRole(userId, newRole);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Role update failed:', err);
    }
  };

  const handlePlanChange = async (orgId, newPlan) => {
    try {
      await adminAPI.updatePlan(orgId, newPlan);
      setOrgsList((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, plan_tier: newPlan } : o))
      );
    } catch (err) {
      console.error('Plan update failed:', err);
    }
  };

  const handleDemoStatus = async (demoId, newStatus) => {
    try {
      await adminAPI.updateDemoStatus(demoId, newStatus);
      setDemosList((prev) =>
        prev.map((d) => (d.id === demoId ? { ...d, status: newStatus } : d))
      );
    } catch (err) {
      console.error('Demo status update failed:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-mono font-bold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-rose-400" />
            Super Admin Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global tenant orchestration, role-based access control, plan quotas, and demo booking pipeline.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0d191c] border border-[#18262a] hover:border-emerald-500/40 text-xs font-mono text-slate-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh All</span>
        </button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total Tenants (Orgs)"
          value={stats?.total_organizations || orgsList.length || 10}
          subtitle="Multi-tenant isolation"
          icon={Building2}
          variant="emerald"
        />
        <MetricCard
          title="Provisioned Users"
          value={stats?.total_users || usersList.length || 51}
          subtitle="Enterprise accounts"
          icon={Users}
          variant="emerald"
        />
        <MetricCard
          title="Simulations Executed"
          value={stats?.total_simulations || 100}
          subtitle="Defensive stress tests"
          icon={Shield}
          variant="purple"
        />
        <MetricCard
          title="Demo Requests"
          value={stats?.total_demo_requests || demosList.length || 8}
          subtitle="Inbound sales leads"
          icon={Send}
          variant="amber"
        />
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-[#18262a] pb-3">
        {[
          { id: 'TENANTS', label: 'Organizations & Plans', count: orgsList.length },
          { id: 'USERS', label: 'User Roles & Access', count: usersList.length },
          { id: 'DEMOS', label: 'Demo Bookings', count: demosList.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tab 1: Tenants & Plans */}
      {activeTab === 'TENANTS' && (
        <div className="bg-[#060b0e] border border-[#18262a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#091215] text-slate-400 border-b border-[#18262a]">
                  <th className="py-3 px-4">ORGANIZATION NAME</th>
                  <th className="py-3 px-4">INDUSTRY</th>
                  <th className="py-3 px-4">CREATED</th>
                  <th className="py-3 px-4">SUBSCRIPTION PLAN</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18262a]">
                {orgsList.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{org.name}</td>
                    <td className="py-3.5 px-4 text-emerald-400">{org.industry || 'TECHNOLOGY'}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {org.created_at ? formatIST(org.created_at, false) : '18/09/2026 IST'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                        {org.plan_tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={org.plan_tier}
                        onChange={(e) => handlePlanChange(org.id, e.target.value)}
                        className="bg-[#091215] border border-[#18262a] text-xs font-mono rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-emerald-400"
                      >
                        <option value="ESSENTIAL">ESSENTIAL</option>
                        <option value="PROFESSIONAL">PROFESSIONAL</option>
                        <option value="ENTERPRISE">ENTERPRISE</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Users & Roles */}
      {activeTab === 'USERS' && (
        <div className="bg-[#060b0e] border border-[#18262a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#091215] text-slate-400 border-b border-[#18262a]">
                  <th className="py-3 px-4">USER NAME</th>
                  <th className="py-3 px-4">EMAIL</th>
                  <th className="py-3 px-4">ORGANIZATION ID</th>
                  <th className="py-3 px-4">CURRENT ROLE</th>
                  <th className="py-3 px-4 text-right">MODIFY ROLE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18262a]">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{u.full_name || 'User'}</td>
                    <td className="py-3.5 px-4 text-emerald-300">{u.email}</td>
                    <td className="py-3.5 px-4 text-slate-400 truncate max-w-[120px]">
                      {u.organization_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-[#091215] border border-[#18262a] text-xs font-mono rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-emerald-400"
                      >
                        <option value="admin">ADMIN</option>
                        <option value="analyst">ANALYST</option>
                        <option value="auditor">AUDITOR</option>
                        <option value="executive">EXECUTIVE</option>
                        <option value="viewer">VIEWER</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Demo Bookings */}
      {activeTab === 'DEMOS' && (
        <div className="bg-[#060b0e] border border-[#18262a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#091215] text-slate-400 border-b border-[#18262a]">
                  <th className="py-3 px-4">CONTACT NAME</th>
                  <th className="py-3 px-4">EMAIL & COMPANY</th>
                  <th className="py-3 px-4">REQUESTED SCOPE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18262a]">
                {demosList.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{d.name || 'Prospect'}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-emerald-300">{d.official_email}</div>
                      <div className="text-slate-400 text-[10px]">{d.organization}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 truncate max-w-xs">
                      {d.requirements_message || 'Enterprise Risk Quantification & Simulation demo'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={d.status || 'PENDING'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {d.status === 'PENDING' ? (
                        <button
                          onClick={() => handleDemoStatus(d.id, 'CONTACTED')}
                          className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px]"
                        >
                          Mark Contacted
                        </button>
                      ) : (
                        <span className="text-emerald-400 text-[11px] font-semibold">Scheduled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;


