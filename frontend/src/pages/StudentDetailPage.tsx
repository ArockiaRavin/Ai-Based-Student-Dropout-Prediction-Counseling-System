import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  GraduationCap,
  Calendar,
  AlertCircle,
  ShieldCheck,
  HeartHandshake,
  Clock,
  CheckCircle2,
  BrainCircuit,
  Plus,
  RefreshCw,
  FileText,
  Sparkles
} from 'lucide-react';
import { api } from '../api';
import { Student, PredictionRecord, CounselingSession, Intervention } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { useAuth } from '../context/AuthContext';

export const StudentDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { canEditStudents } = useAuth();

  const [student, setStudent] = useState<Student | null>(null);
  const [latestPred, setLatestPred] = useState<PredictionRecord | null>(null);
  const [predHistory, setPredHistory] = useState<PredictionRecord[]>([]);
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Counseling Session Dialog
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    counselor_name: 'Prof. Sunita Krishnan',
    session_date: new Date().toISOString().split('T')[0],
    support_category: 'Academic Support',
    notes: '',
    action_plan: '',
    follow_up_date: '',
    status: 'Completed'
  });

  useEffect(() => {
    if (studentId) {
      loadStudentProfile(studentId);
    }
  }, [studentId]);

  const loadStudentProfile = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudent(id);
      setStudent(res.student);
      setLatestPred(res.latest_prediction || null);
      setPredHistory(res.predictions_history || []);
      setSessions(res.counseling_sessions || []);
      setInterventions(res.interventions || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    try {
      await api.createCounselingSession({
        student_id: student.student_id,
        ...sessionForm
      });
      setIsSessionModalOpen(false);
      loadStudentProfile(student.student_id);
    } catch (err: any) {
      alert(err.message || 'Failed to record session');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading student dossier...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#FB7185] mx-auto" />
        <h3 className="text-lg font-bold text-white">
          {error ? 'Unable to Load Student Dossier' : 'Student Profile Not Found'}
        </h3>
        {error && <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>}
        <div className="flex items-center justify-center gap-3">
          {studentId && (
            <button
              onClick={() => loadStudentProfile(studentId)}
              className="px-4 py-2 bg-indigo-600/50 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          )}
          <Link to="/students" className="text-cyan-400 text-sm font-semibold hover:underline">
            &larr; Back to Student Cohort
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <Link
          to="/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students List</span>
        </Link>

        {canEditStudents && (
          <button
            onClick={() => setIsSessionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Counseling Session</span>
          </button>
        )}
      </div>

      {/* Hero Overview Card */}
      <div className="glass-panel rounded-3xl border border-white/15 p-6 sm:p-7 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-2xl">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-2xl font-mono shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            {student.first_name[0]}{student.last_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-white">{student.first_name} {student.last_name}</h2>
              {latestPred && (
                <RiskBadge category={latestPred.risk_category} score={latestPred.risk_score} size="md" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5 font-mono">
              <span>ID: <strong className="text-cyan-300">{student.student_id}</strong></span>
              <span>•</span>
              <span>Dept: <strong className="text-slate-200">{student.department}</strong></span>
              <span>•</span>
              <span>Semester: <strong className="text-slate-200">{student.semester}</strong></span>
              <span>•</span>
              <span>Email: <strong className="text-slate-300">{student.email}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Academic Metric Badges */}
        <div className="grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 text-center">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Attendance</span>
            <div className={`text-xl font-bold font-mono mt-0.5 ${student.attendance_pct < 75 ? 'text-[#FB7185]' : 'text-[#34D399]'}`}>
              {student.attendance_pct}%
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">CGPA</span>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {student.gpa.toFixed(2)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Internal</span>
            <div className="text-xl font-bold font-mono text-cyan-300 mt-0.5">
              {student.internal_marks}
            </div>
          </div>
        </div>
      </div>

      {/* Contributing Factors & Positive Indicators (from ML model) */}
      {latestPred && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl border border-rose-500/25 bg-rose-500/10 p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FB7185]" />
              Identified Primary Risk Factors ({latestPred.model_used})
            </h3>
            <ul className="space-y-2 text-xs text-rose-200">
              {latestPred.factors.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#FB7185] font-bold">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#34D399]" />
              Positive Protective Factors
            </h3>
            <ul className="space-y-2 text-xs text-emerald-200">
              {latestPred.positive_indicators.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399] shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Suggested Counseling Action Plan */}
      {latestPred && (
        <div className="glass-card rounded-2xl border border-indigo-500/25 bg-indigo-500/10 p-5 space-y-3 shadow-xl">
          <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-cyan-400" />
            AI Recommended Support Interventions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
            {latestPred.recommendations.map((rec, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 font-medium">
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs: Counseling Sessions & Interventions History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Counseling Sessions */}
        <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-cyan-400" />
              Counseling Sessions ({sessions.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">1-on-1 History</span>
          </div>

          {sessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No counseling sessions recorded for this student yet.
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => (
                <div key={s.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{s.support_category}</span>
                    <span className="font-mono text-cyan-400 text-[11px]">{s.session_date}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{s.notes}</p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Counselor: <strong className="text-slate-200">{s.counselor_name}</strong></span>
                    {s.follow_up_date && (
                      <span className="text-cyan-400 font-semibold">
                        Follow-up: {s.follow_up_date}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Interventions */}
        <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Assigned Interventions ({interventions.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Ongoing Support</span>
          </div>

          {interventions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No specific interventions assigned to this student.
            </div>
          ) : (
            <div className="space-y-3">
              {interventions.map(i => (
                <div key={i.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{i.title}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {i.status}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{i.description}</p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Assigned to: <strong className="text-slate-200">{i.assigned_to}</strong></span>
                    <span>Target Date: <strong className="text-cyan-300">{i.target_date}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Longitudinal Prediction History */}
      <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          ML Risk Assessment Longitudinal History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-slate-400 font-semibold border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Model Used</th>
                <th className="py-2.5 px-3">Risk Category</th>
                <th className="py-2.5 px-3">Probability Score</th>
                <th className="py-2.5 px-3">Key Risk Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {predHistory.map(p => (
                <tr key={p.id}>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{p.created_at}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-200">{p.model_used}</td>
                  <td className="py-2.5 px-3">
                    <RiskBadge category={p.risk_category} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-white">{p.risk_score}%</td>
                  <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                    {p.factors[0] || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Counseling Session Modal */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-panel rounded-3xl border border-white/20 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-base text-white">
              Record Counseling Session: {student.first_name} {student.last_name}
            </h3>
            <form onSubmit={handleRecordSession} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Support Category *</label>
                <select
                  value={sessionForm.support_category}
                  onChange={e => setSessionForm({ ...sessionForm, support_category: e.target.value })}
                  className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="Academic Support">Academic Support (Remedial &amp; Tutoring)</option>
                  <option value="Attendance Improvement">Attendance Improvement &amp; Compliance</option>
                  <option value="Mentoring">General Mentoring &amp; Well-being</option>
                  <option value="Career Guidance">Career Guidance &amp; Course Planning</option>
                  <option value="Financial Support Referral">Financial Support Referral</option>
                  <option value="Regular Follow-up">Regular Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Counselor Notes &amp; Student Observations *</label>
                <textarea
                  required
                  rows={3}
                  value={sessionForm.notes}
                  onChange={e => setSessionForm({ ...sessionForm, notes: e.target.value })}
                  placeholder="Summarize discussion, roadblocks discussed, and student response..."
                  className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Agreed Action Plan &amp; Commitment *</label>
                <textarea
                  required
                  rows={2}
                  value={sessionForm.action_plan}
                  onChange={e => setSessionForm({ ...sessionForm, action_plan: e.target.value })}
                  placeholder="Steps the student committed to undertake before next check-in..."
                  className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Scheduled Follow-up Date</label>
                  <input
                    type="date"
                    value={sessionForm.follow_up_date}
                    onChange={e => setSessionForm({ ...sessionForm, follow_up_date: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Counselor Name</label>
                  <input
                    type="text"
                    required
                    value={sessionForm.counselor_name}
                    onChange={e => setSessionForm({ ...sessionForm, counselor_name: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="px-4 py-2 border border-white/10 text-slate-300 rounded-xl font-medium hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-bold hover:from-indigo-500 hover:to-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                >
                  Save Counseling Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
