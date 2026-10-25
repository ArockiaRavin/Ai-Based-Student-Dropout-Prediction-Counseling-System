import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart as LineChartIcon,
  Filter,
  AlertCircle,
  TrendingDown,
  Layers,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../api';
import { RiskBadge } from '../components/RiskBadge';

export const RiskAnalysisPage: React.FC = () => {
  const [department, setDepartment] = useState('All');
  const [semester, setSemester] = useState<string>('All');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskAnalysis();
  }, [department, semester]);

  const fetchRiskAnalysis = async () => {
    try {
      setLoading(true);
      const res = await api.getRiskAnalysis(
        department !== 'All' ? department : undefined,
        semester !== 'All' ? parseInt(semester) : undefined
      );
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const departmentsList = [
    'All',
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering'
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <LineChartIcon className="w-6 h-6" />
            </div>
            Population Risk &amp; Vulnerability Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Epidemiological analysis of institutional retention patterns, attendance thresholds, and grade brackets.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0B1224] px-3.5 py-2 rounded-xl border border-white/10 shadow-md">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="text-xs text-white font-medium bg-transparent focus:outline-none"
            >
              {departmentsList.map(d => (
                <option key={d} value={d} className="bg-[#0B1224]">{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </select>
          </div>

          <div className="bg-[#0B1224] px-3.5 py-2 rounded-xl border border-white/10 shadow-md">
            <select
              value={semester}
              onChange={e => setSemester(e.target.value)}
              className="text-xs text-white font-medium bg-transparent focus:outline-none"
            >
              <option value="All" className="bg-[#0B1224]">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s} className="bg-[#0B1224]">Semester {s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Computing cross-sectional risk distributions...</p>
        </div>
      ) : !data ? (
        <div className="p-8 text-center text-xs text-slate-500">Failed to load risk analysis data.</div>
      ) : (
        <>
          {/* Scientific Caution Alert */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white">Methodological Distinction:</strong> Statistical correlations observed below between attendance deficits and dropout risk reflect multi-factor probability vectors rather than direct isolated causes. Interventions should explore underlying personal, academic, and financial stressors.
            </p>
          </div>

          {/* Section 1: Bracket Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Brackets Chart */}
            <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-xl">
              <h3 className="text-sm font-bold text-white">Attendance Bracket Distribution</h3>
              <p className="text-xs text-slate-400 mt-1">Students grouped by statutory attendance compliance tiers</p>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.attendance_brackets} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
                    <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(11, 18, 36, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="students" name="Students in Cohort" fill="#818CF8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GPA Brackets Chart */}
            <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-xl">
              <h3 className="text-sm font-bold text-white">Academic Standing (CGPA) Distribution</h3>
              <p className="text-xs text-slate-400 mt-1">Vulnerability concentration across CGPA brackets</p>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.gpa_brackets} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
                    <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(11, 18, 36, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="students" name="Students in Cohort" fill="#22D3EE" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Section 2: Top At-Risk Cohort Table */}
          <div className="glass-card rounded-2xl border border-white/10 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Filtered Cohort: Highest Risk Students ({data.total_analyzed} students analyzed)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Prioritized for immediate faculty advisory intervention</p>
              </div>
              <Link to="/students" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <span>View in Student Manager</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-slate-400 font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3 text-center">Semester</th>
                    <th className="py-3 px-3 text-center">Attendance</th>
                    <th className="py-3 px-3 text-center">CGPA</th>
                    <th className="py-3 px-3">Risk Assessment</th>
                    <th className="py-3 px-3 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.students.map((st: any) => (
                    <tr key={st.student_id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{st.first_name} {st.last_name}</div>
                        <div className="text-[10px] font-mono text-cyan-400/80">{st.student_id}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{st.department}</td>
                      <td className="py-3 px-3 text-center font-mono text-white">{st.semester}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#FB7185]">{st.attendance_pct}%</td>
                      <td className="py-3 px-3 text-center font-mono text-white">{st.gpa.toFixed(2)}</td>
                      <td className="py-3 px-3">
                        <RiskBadge category={st.risk_category} score={st.risk_score} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/students/${st.student_id}`}
                          className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
                        >
                          <span>Profile</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
