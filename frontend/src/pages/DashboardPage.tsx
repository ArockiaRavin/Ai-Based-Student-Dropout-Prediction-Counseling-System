import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  HeartHandshake,
  CalendarCheck,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  Filter,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Activity,
  ChevronRight
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  ZAxis
} from 'recharts';
import { api } from '../api';
import { DashboardSummary } from '../types';
import { KPICard } from '../components/KPICard';
import { RiskBadge } from '../components/RiskBadge';
import { useAuth } from '../context/AuthContext';
import { UserManagementModal } from '../components/UserManagementModal';
import { Shield, Eye, Lock, CheckCircle2, UserCheck } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, role, isAdmin, isCounselor, isViewer } = useAuth();
  const cachedSummary = api.getCached<DashboardSummary>('/analytics/dashboard-summary');
  const [data, setData] = useState<DashboardSummary | null>(cachedSummary);
  const [loading, setLoading] = useState(!cachedSummary);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard(Boolean(cachedSummary));
  }, []);

  const loadDashboard = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      const summary = await api.getDashboardSummary(!silent);
      setData(summary);
    } catch (err: any) {
      if (!data) {
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
          <div className="absolute inset-0 rounded-full blur-md bg-cyan-400/30 -z-10" />
        </div>
        <p className="text-sm font-semibold text-slate-300 tracking-wide">
          Streaming neural risk telemetry &amp; analytics...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Dashboard Telemetry Unavailable</h3>
        <p className="text-sm text-slate-400">{error || 'Could not fetch dashboard summary'}</p>
        <button
          onClick={() => loadDashboard(false)}
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-xs font-bold hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] inline-flex items-center gap-2 mx-auto disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-300" />
              <span>Reconnecting...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-cyan-300" />
              <span>Retry Connection</span>
            </>
          )}
        </button>
      </div>
    );
  }

  const { kpis, risk_distribution, department_breakdown, scatter_plot, semester_trends, risk_factors, priority_attention, recent_activity } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Top Header / Demonstration Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Institutional Retention Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time analytics, machine-learning risk predictions, and counselor intervention telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-medium px-3 py-1.5 rounded-xl bg-white/[0.04] text-slate-300 border border-white/10">
            Cohort Active: N={kpis.total_students}
          </span>
          <button
            onClick={() => loadDashboard(false)}
            disabled={loading || isRefreshing}
            className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] text-slate-200 text-xs flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline font-semibold">{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Role-Specific Mission & Clearance Banner */}
      {isAdmin && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-indigo-900/30 to-purple-950/40 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_25px_rgba(99,102,241,0.15)] animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Administrator Control Workspace</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 font-mono">
                  FULL PRIVILEGES
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Authorized administrator: {user?.name}. You have access to user management, counselor approvals, model insights, and audit records.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => setShowUserModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-cyan-300" />
              <span>Manage User Roles &amp; Accounts</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
            >
              Settings &amp; Audit
            </button>
          </div>
        </div>
      )}

      {isCounselor && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-teal-900/30 to-indigo-950/40 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_25px_rgba(34,211,238,0.15)] animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0 mt-0.5">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Counselor Intervention Workspace</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 font-mono">
                  COUNSELOR SCOPE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Counselor: {user?.name}. Manage high-risk cases, record student counseling sessions, and coordinate intervention outcomes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => navigate('/counselor-center')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all flex items-center gap-1.5"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Counselor Center</span>
            </button>
            <button
              onClick={() => navigate('/interventions')}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
            >
              Interventions Queue
            </button>
          </div>
        </div>
      )}

      {isViewer && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/30 to-slate-900/50 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_25px_rgba(168,85,247,0.15)] animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0 mt-0.5">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Academic Faculty &amp; Viewer Portal</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-500/40 font-mono">
                  READ-ONLY ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Viewer: {user?.name}. You have permitted access to academic retention distributions, risk statistics, and department analytics. Student contact information is masked for student privacy.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className="text-[11px] font-medium text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              Write Operations Restricted
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          title="Total Students"
          value={kpis.total_students}
          icon={<Users className="w-5 h-5" />}
          subtitle="All departments"
          accentColor="blue"
          onClick={() => navigate('/students')}
        />
        <KPICard
          title="High-Risk Students"
          value={kpis.high_risk}
          icon={<AlertCircle className="w-5 h-5" />}
          subtitle="Immediate action"
          accentColor="rose"
          trend={{ value: `${Math.round((kpis.high_risk / (kpis.total_students || 1)) * 100)}%`, isPositive: false }}
          onClick={() => navigate('/students?risk_level=HIGH+RISK')}
        />
        <KPICard
          title="Medium-Risk Students"
          value={kpis.medium_risk}
          icon={<AlertTriangle className="w-5 h-5" />}
          subtitle="Monitored cohort"
          accentColor="amber"
          trend={{ value: `${Math.round((kpis.medium_risk / (kpis.total_students || 1)) * 100)}%`, isPositive: true }}
          onClick={() => navigate('/students?risk_level=MEDIUM+RISK')}
        />
        <KPICard
          title="Low-Risk Students"
          value={kpis.low_risk}
          icon={<ShieldCheck className="w-5 h-5" />}
          subtitle="Good standing"
          accentColor="emerald"
          onClick={() => navigate('/students?risk_level=LOW+RISK')}
        />
        <KPICard
          title="Pending Counseling"
          value={kpis.awaiting_counseling}
          icon={<HeartHandshake className="w-5 h-5" />}
          subtitle="High risk unassigned"
          accentColor="indigo"
          onClick={() => navigate('/counselor-center')}
        />
        <KPICard
          title="Follow-ups Due"
          value={kpis.followups_due}
          icon={<CalendarCheck className="w-5 h-5" />}
          subtitle="Active cases"
          accentColor="teal"
          onClick={() => navigate('/interventions')}
        />
      </div>

      {/* Primary Analytics Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Donut Chart - Risk Distribution */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Student Risk Distribution</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Active Inference
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Categorization based on active Random Forest classifier</p>
          </div>
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="rgba(11, 18, 36, 0.8)"
                  strokeWidth={2}
                >
                  {risk_distribution.map((entry, index) => {
                    const color = entry.name.includes('High') ? '#FB7185' : entry.name.includes('Medium') ? '#FBBF24' : '#34D399';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} students`, name]}
                  contentStyle={{
                    backgroundColor: 'rgba(11, 18, 36, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">Model: Random Forest (Champion)</span>
            <Link to="/model-insights" className="text-cyan-400 font-semibold hover:text-cyan-300 flex items-center gap-1">
              <span>Inspect Model</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Chart 2: Bar Chart - Risk by Department */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Dropout Risk Distribution by Department</h3>
              <p className="text-xs text-slate-400 mt-1">Comparative vulnerability across engineering branches</p>
            </div>
            <Link to="/risk-analysis" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              <span>Full Breakdown</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={department_breakdown} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.07)" />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(11, 18, 36, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={32}
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
                <Bar dataKey="low_risk" name="Low Risk" fill="#34D399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medium_risk" name="Medium Risk" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                <Bar dataKey="high_risk" name="High Risk" fill="#FB7185" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Analytics Section: Scatter Plot & Academic Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 3: Scatter Plot - Attendance vs Dropout Risk Score */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-5 border border-white/10 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-white">Attendance (%) vs. Predicted Dropout Risk Score (%)</h3>
            <p className="text-xs text-slate-400 mt-1">Strong inverse correlation: attendance deficits directly drive risk probability</p>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" />
                <XAxis
                  type="number"
                  dataKey="attendance_pct"
                  name="Attendance"
                  unit="%"
                  domain={[30, 100]}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <YAxis
                  type="number"
                  dataKey="risk_score"
                  name="Risk Score"
                  unit="%"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <ZAxis range={[60, 60]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255, 255, 255, 0.2)' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="glass-panel p-3 rounded-xl border border-white/15 text-xs space-y-1 shadow-2xl">
                          <p className="font-bold text-white">{d.name}</p>
                          <p className="text-slate-400">{d.department}</p>
                          <div className="pt-1.5 border-t border-white/10 space-y-0.5">
                            <p className="text-slate-300">Attendance: <span className="font-mono font-bold text-cyan-400">{d.attendance_pct}%</span></p>
                            <p className="text-slate-300">Risk Score: <span className="font-mono font-bold text-[#FB7185]">{d.risk_score}%</span></p>
                            <p className="text-slate-300">Tier: <span className="font-semibold text-white">{d.risk_category}</span></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Students" data={scatter_plot} fill="#818CF8" fillOpacity={0.85} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Line Chart - Semester Academic Performance vs Risk */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-5 border border-white/10 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-white">Academic Standing &amp; Average Risk Across Semesters</h3>
            <p className="text-xs text-slate-400 mt-1">Critical transition points (Semesters 3-4 historically most vulnerable)</p>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={semester_trends} margin={{ top: 10, right: 15, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" />
                <XAxis
                  dataKey="semester"
                  tickFormatter={s => `Sem ${s}`}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(11, 18, 36, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={32}
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
                <Line type="monotone" dataKey="avg_attendance" name="Avg Attendance %" stroke="#22D3EE" strokeWidth={2.5} dot={{ r: 4, fill: '#22D3EE' }} />
                <Line type="monotone" dataKey="avg_risk_score" name="Avg Risk Score %" stroke="#FB7185" strokeWidth={2.5} dot={{ r: 4, fill: '#FB7185' }} />
                <Line type="monotone" dataKey="avg_internal" name="Avg Internal Marks" stroke="#818CF8" strokeWidth={2.5} dot={{ r: 4, fill: '#818CF8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tertiary Section: Priority Attention List & Primary Risk Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Priority Attention Table */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-5 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#FB7185]" />
                Priority Attention: High-Risk Students Awaiting Follow-Up
              </h3>
              <p className="text-xs text-slate-400 mt-1">Students flagged by algorithm requiring immediate counselor consultation</p>
            </div>
            <Link to="/counselor-center" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              <span>Open Counselor Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-slate-300 font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3 px-3">Student Name / ID</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3 text-center">Attendance</th>
                  <th className="py-3 px-3 text-center">CGPA</th>
                  <th className="py-3 px-3">Risk Assessment</th>
                  <th className="py-3 px-3 text-center">Sessions Held</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {priority_attention.map(st => (
                  <tr key={st.student_id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{st.first_name} {st.last_name}</div>
                      <div className="text-[11px] font-mono text-cyan-400/80">{st.student_id}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <div>{st.department}</div>
                      <div className="text-[10px] text-slate-400">Semester {st.semester}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#FB7185]">
                      {st.attendance_pct}%
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-white">
                      {st.gpa.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge category={st.risk_category} score={st.risk_score} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      {st.session_count > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-[10px]">
                          {st.session_count} session(s)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-[#FB7185] border border-rose-500/30 font-semibold text-[10px]">
                          0 (Pending)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/students/${st.student_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
                      >
                        <span>Profile</span>
                        <ExternalLink className="w-3 h-3 text-cyan-400" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Factors Horizontal Breakdown & Timeline */}
        <div className="lg:col-span-4 space-y-6">
          {/* Risk Factors Bar List */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 shadow-xl">
            <h3 className="text-sm font-bold text-white">Primary Causal Risk Drivers</h3>
            <p className="text-xs text-slate-400 mt-1">Prevalence among high &amp; medium risk cohorts</p>
            <div className="mt-4 space-y-3.5">
              {risk_factors.map((f, i) => {
                const maxCount = Math.max(...risk_factors.map(x => x.count), 1);
                const pct = Math.round((f.count / maxCount) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-200">{f.factor}</span>
                      <span className="font-mono text-cyan-400 font-bold">{f.count} cases</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-[#FB7185] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Audit Timeline */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 shadow-xl">
            <h3 className="text-sm font-bold text-white">Recent Activity Timeline</h3>
            <p className="text-xs text-slate-400 mt-1">Automated and counselor audit logs</p>
            <div className="mt-3.5 space-y-3.5 max-h-56 overflow-y-auto pr-1">
              {recent_activity.map((act, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">{act.action}</p>
                    <p className="text-slate-400 text-[11px] leading-snug mt-0.5">{act.details}</p>
                    <span className="text-[10px] text-slate-500 font-mono">{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admin User Management Modal */}
      {isAdmin && (
        <UserManagementModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
        />
      )}
    </div>
  );
};
