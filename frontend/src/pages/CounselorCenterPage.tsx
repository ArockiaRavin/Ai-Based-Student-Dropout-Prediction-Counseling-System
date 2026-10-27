import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Plus,
  RefreshCw,
  UserCheck,
  FileText,
  Search,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { api } from '../api';
import { CounselingSession, Student } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { useAuth } from '../context/AuthContext';

export const CounselorCenterPage: React.FC = () => {
  const { user, canEditStudents } = useAuth();
  const cachedSessions = api.getCached<{ sessions: CounselingSession[]; total: number }>('/counseling/sessions?');
  const cachedOverview = api.getCached<any>('/counseling/overview');

  const [sessions, setSessions] = useState<CounselingSession[]>(cachedSessions?.sessions || []);
  const [priorityCases, setPriorityCases] = useState<any[]>(cachedOverview?.priority_cases || []);
  const [upcomingFollowups, setUpcomingFollowups] = useState<any[]>(cachedOverview?.upcoming_followups || []);
  const [loading, setLoading] = useState(!cachedSessions || !cachedOverview);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New Session Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>(() => api.getCached<{ students: Student[]; total: number }>('/students?sort_by=id&sort_order=asc')?.students || []);
  const [form, setForm] = useState({
    student_id: '',
    counselor_name: user?.name || 'Prof. Sunita Krishnan',
    session_date: new Date().toISOString().split('T')[0],
    support_category: 'Academic Support',
    notes: '',
    action_plan: '',
    follow_up_date: '',
    status: 'Completed'
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hasCache = Boolean(cachedSessions && cachedOverview);
    loadCounselorHub(hasCache);
    if (students.length === 0) {
      api.getStudents().then(res => setStudents(res.students || [])).catch(() => {});
    }
  }, []);

  const loadCounselorHub = async (silent = false) => {
    try {
      if (!silent || (!sessions.length && !priorityCases.length)) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      const [sessionsRes, overviewRes] = await Promise.all([
        api.getCounselingSessions(undefined, undefined, undefined, !silent),
        api.getCounselorOverview(!silent)
      ]);
      setSessions(sessionsRes.sessions || []);
      setPriorityCases(overviewRes.priority_cases || []);
      setUpcomingFollowups(overviewRes.upcoming_followups || []);
    } catch (err: any) {
      console.error(err);
      if (!sessions.length && !priorityCases.length) {
        setError(err.message || 'Failed to load counselor center records');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRecordSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id) {
      alert('Please select a student');
      return;
    }
    try {
      await api.createCounselingSession(form);
      setIsModalOpen(false);
      setForm({
        student_id: '',
        counselor_name: user?.name || 'Prof. Sunita Krishnan',
        session_date: new Date().toISOString().split('T')[0],
        support_category: 'Academic Support',
        notes: '',
        action_plan: '',
        follow_up_date: '',
        status: 'Completed'
      });
      loadCounselorHub();
    } catch (err: any) {
      alert(err.message || 'Error recording session');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <HeartHandshake className="w-6 h-6" />
            </div>
            Counselor Intervention Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Student pastoral care center: 1-on-1 diagnostic sessions, support action plans, and longitudinal follow-up tracking.
          </p>
        </div>

        {canEditStudents && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Counseling Session</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading counselor center records...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-xs text-slate-400">{error}</p>
          <button
            onClick={() => loadCounselorHub(false)}
            className="px-4 py-2 bg-indigo-600/50 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : (
        <>
          {/* Top Priority Cases Section */}
          <div className="glass-card rounded-2xl border border-white/10 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#FB7185]" />
                  High-Priority Student Cases Requiring Active Mentoring
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Identified by prediction model with composite risk likelihood exceeding 65%
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-rose-500/20 text-[#FB7185] px-3 py-1 rounded-full border border-rose-500/30">
                {priorityCases.length} Critical Cases
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priorityCases.slice(0, 6).map((c: any) => (
                <div
                  key={c.student_id}
                  className="glass-card rounded-2xl p-4 border border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.07] transition-all duration-300 space-y-3 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {c.first_name} {c.last_name}
                      </h4>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">{c.student_id} • {c.department}</div>
                    </div>
                    <RiskBadge category={c.risk_category} score={c.risk_score} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/[0.03] p-2.5 rounded-xl border border-white/10">
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px]">Attendance:</span>
                      <strong className="text-[#FB7185] font-mono text-sm">{c.attendance_pct}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px]">CGPA:</span>
                      <strong className="text-white font-mono text-sm">{c.gpa.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-400">
                      Sessions Held: <strong className="text-white font-mono">{c.sessions_held || 0}</strong>
                    </span>
                    <Link
                      to={`/students/${c.student_id}`}
                      className="text-cyan-400 font-semibold hover:text-cyan-300 inline-flex items-center gap-1"
                    >
                      <span>Open Dossier</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Grid: Upcoming Follow-ups & Recent Counseling Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Upcoming Follow-ups (5 cols) */}
            <div className="lg:col-span-5 glass-card rounded-2xl border border-white/10 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Scheduled Follow-up Calendar
                </h3>
                <span className="text-xs text-slate-400 font-mono">{upcomingFollowups.length} scheduled</span>
              </div>

              {upcomingFollowups.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No pending follow-ups scheduled.</div>
              ) : (
                <div className="space-y-3">
                  {upcomingFollowups.map((f: any) => (
                    <div
                      key={f.id}
                      className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] flex items-start gap-3"
                    >
                      <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono text-center shrink-0">
                        <Clock className="w-4 h-4 mx-auto" />
                        <span className="text-[10px] font-bold block mt-1">{f.follow_up_date}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {f.first_name} {f.last_name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{f.support_category} • {f.counselor_name}</p>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 italic">"{f.action_plan}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sessions Table (7 cols) */}
            <div className="lg:col-span-7 glass-card rounded-2xl border border-white/10 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Recent Counseling Sessions ({sessions.length})
                </h3>
                <span className="text-xs text-slate-400 font-mono">All Departments</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-slate-400 font-semibold border-b border-white/10">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Support Area</th>
                      <th className="py-2.5 px-3">Counselor</th>
                      <th className="py-2.5 px-3">Follow-up</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sessions.map(s => (
                      <tr key={s.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{s.session_date}</td>
                        <td className="py-2.5 px-3">
                          <Link
                            to={`/students/${s.student_id}`}
                            className="font-bold text-white hover:text-cyan-300"
                          >
                            {s.student_name}
                          </Link>
                          <div className="text-[10px] font-mono text-cyan-400/80">{s.student_id}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/10 text-[11px]">
                            {s.support_category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-medium">{s.counselor_name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {s.follow_up_date || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Record Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-panel rounded-3xl border border-white/20 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-base text-white">Record New Counseling Session</h3>
            <form onSubmit={handleRecordSession} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Select Student *</label>
                <select
                  required
                  value={form.student_id}
                  onChange={e => setForm({ ...form, student_id: e.target.value })}
                  className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white font-medium"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(st => (
                    <option key={st.student_id} value={st.student_id}>
                      {st.first_name} {st.last_name} ({st.student_id} - {st.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Support Category *</label>
                <select
                  value={form.support_category}
                  onChange={e => setForm({ ...form, support_category: e.target.value })}
                  className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="Academic Support">Academic Support (Remedial &amp; Course Tutoring)</option>
                  <option value="Attendance Improvement">Attendance Improvement &amp; Compliance</option>
                  <option value="Mentoring">General Mentoring &amp; Well-being</option>
                  <option value="Career Guidance">Career Guidance &amp; Course Planning</option>
                  <option value="Financial Support Referral">Financial Support Referral</option>
                  <option value="Regular Follow-up">Regular Follow-up Check-in</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Counselor Discussion Notes *</label>
                <textarea
                  required
                  rows={3}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Record summary of 1-on-1 interview and identified root causes..."
                  className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Student Agreed Action Plan *</label>
                <textarea
                  required
                  rows={2}
                  value={form.action_plan}
                  onChange={e => setForm({ ...form, action_plan: e.target.value })}
                  placeholder="Concrete milestones agreed upon (e.g. remedial classes, assignments)..."
                  className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Follow-up Target Date</label>
                  <input
                    type="date"
                    value={form.follow_up_date}
                    onChange={e => setForm({ ...form, follow_up_date: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Counselor In-Charge</label>
                  <input
                    type="text"
                    required
                    value={form.counselor_name}
                    onChange={e => setForm({ ...form, counselor_name: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-white/10 text-slate-300 rounded-xl font-medium hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-bold hover:from-indigo-500 hover:to-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                >
                  Save Counseling Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
