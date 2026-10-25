import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Filter,
  UserCheck,
  Calendar,
  ExternalLink,
  Edit,
  X,
  Sparkles
} from 'lucide-react';
import { api } from '../api';
import { Intervention, Student } from '../types';
import { useAuth } from '../context/AuthContext';
import { KPICard } from '../components/KPICard';

export const InterventionTrackingPage: React.FC = () => {
  const { user, canManageInterventions } = useAuth();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [summary, setSummary] = useState<any>({
    total: 0,
    completed: 0,
    in_progress: 0,
    scheduled: 0,
    needs_followup: 0,
    new: 0
  });
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  const [form, setForm] = useState({
    student_id: '',
    title: '',
    description: '',
    category: 'Academic Support',
    assigned_to: user?.name || 'Prof. Sunita Krishnan',
    status: 'New' as any,
    target_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    outcome_notes: ''
  });

  useEffect(() => {
    loadInterventions();
    api.getStudents().then(res => setStudents(res.students || [])).catch(() => {});
  }, [statusFilter]);

  const loadInterventions = async () => {
    try {
      setLoading(true);
      const res = await api.getInterventions(statusFilter !== 'All' ? statusFilter : undefined);
      setInterventions(res.interventions || []);
      setSummary(res.summary || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createIntervention(form);
      setIsAddModalOpen(false);
      loadInterventions();
    } catch (err: any) {
      alert(err.message || 'Error creating intervention');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntervention) return;
    try {
      await api.updateIntervention(selectedIntervention.id, form);
      setIsEditModalOpen(false);
      loadInterventions();
    } catch (err: any) {
      alert(err.message || 'Error updating intervention');
    }
  };

  const openEditModal = (item: Intervention) => {
    setSelectedIntervention(item);
    setForm({
      student_id: item.student_id,
      title: item.title,
      description: item.description,
      category: item.category,
      assigned_to: item.assigned_to,
      status: item.status,
      target_date: item.target_date,
      outcome_notes: item.outcome_notes || ''
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <CheckSquare className="w-6 h-6" />
            </div>
            Student Intervention Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Accountability and milestone monitoring for ongoing student retention support and counseling outcomes.
          </p>
        </div>

        {canManageInterventions && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Intervention</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard
          title="Total Actions"
          value={summary.total || 0}
          icon={<CheckSquare className="w-5 h-5" />}
          subtitle="All recorded actions"
          accentColor="indigo"
          onClick={() => setStatusFilter('All')}
        />
        <KPICard
          title="In Progress"
          value={summary.in_progress || 0}
          icon={<Clock className="w-5 h-5" />}
          subtitle="Active interventions"
          accentColor="blue"
          onClick={() => setStatusFilter('In Progress')}
        />
        <KPICard
          title="Scheduled"
          value={summary.scheduled || 0}
          icon={<Calendar className="w-5 h-5" />}
          subtitle="Planned sessions"
          accentColor="amber"
          onClick={() => setStatusFilter('Scheduled')}
        />
        <KPICard
          title="Needs Follow-up"
          value={summary.needs_followup || 0}
          icon={<AlertCircle className="w-5 h-5" />}
          subtitle="Attention required"
          accentColor="rose"
          onClick={() => setStatusFilter('Needs Follow-up')}
        />
        <KPICard
          title="Completed"
          value={summary.completed || 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          subtitle="Successful resolutions"
          accentColor="emerald"
          onClick={() => setStatusFilter('Completed')}
        />
      </div>

      {/* Interventions Table Container */}
      <div className="glass-card rounded-2xl border border-white/10 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
          <div className="flex items-center gap-2.5">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300 font-mono">STATUS FILTER:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs bg-[#0B1224] border border-white/10 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-indigo-500/50"
            >
              <option value="All">All Statuses ({summary.total})</option>
              <option value="New">New ({summary.new})</option>
              <option value="Scheduled">Scheduled ({summary.scheduled})</option>
              <option value="In Progress">In Progress ({summary.in_progress})</option>
              <option value="Completed">Completed ({summary.completed})</option>
              <option value="Needs Follow-up">Needs Follow-up ({summary.needs_followup})</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Showing {interventions.length} items
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-400">Loading intervention records...</p>
          </div>
        ) : interventions.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No interventions found matching this status filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-slate-400 font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Intervention Title &amp; Scope</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Assigned Counselor</th>
                  <th className="py-3 px-3">Target Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {interventions.map(item => {
                  const statusStyles: Record<string, string> = {
                    'New': 'bg-white/[0.05] text-slate-300 border-white/10',
                    'Scheduled': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
                    'In Progress': 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30',
                    'Completed': 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30',
                    'Needs Follow-up': 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/30'
                  };

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-3">
                        <Link
                          to={`/students/${item.student_id}`}
                          className="font-bold text-white hover:text-cyan-300"
                        >
                          {item.student_name}
                        </Link>
                        <div className="text-[10px] font-mono text-cyan-400/80">{item.student_id} • {item.department}</div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-semibold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{item.description}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{item.category}</td>
                      <td className="py-3 px-3 font-medium text-slate-200">{item.assigned_to}</td>
                      <td className="py-3 px-3 font-mono text-slate-300">{item.target_date}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-md ${statusStyles[item.status] || ''}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/students/${item.student_id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06]"
                            title="View Student"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          {canManageInterventions && (
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-white/[0.06]"
                              title="Update Status"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-panel rounded-3xl border border-white/20 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-base text-white">
              {isAddModalOpen ? 'Create Student Support Intervention' : `Update Intervention #${selectedIntervention?.id}`}
            </h3>
            <form onSubmit={isAddModalOpen ? handleCreate : handleUpdate} className="space-y-3.5 text-xs">
              {isAddModalOpen && (
                <div>
                  <label className="block text-slate-300 mb-1">Target Student *</label>
                  <select
                    required
                    value={form.student_id}
                    onChange={e => setForm({ ...form, student_id: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map(st => (
                      <option key={st.student_id} value={st.student_id}>
                        {st.first_name} {st.last_name} ({st.student_id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1">Intervention Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Remedial Tutoring & Course Clearance"
                  className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 font-medium text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Detailed Description &amp; Objectives *</label>
                <textarea
                  required
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Specific actions to assist student recovery..."
                  className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="Academic Support">Academic Support</option>
                    <option value="Attendance Improvement">Attendance Improvement</option>
                    <option value="Mentoring">Mentoring</option>
                    <option value="Financial Support Referral">Financial Support</option>
                    <option value="Career Guidance">Career Guidance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Status *</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white font-semibold"
                  >
                    <option value="New">New</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Needs Follow-up">Needs Follow-up</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    required
                    value={form.target_date}
                    onChange={e => setForm({ ...form, target_date: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Assigned Counselor</label>
                  <input
                    type="text"
                    required
                    value={form.assigned_to}
                    onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Outcome &amp; Progress Notes</label>
                <textarea
                  rows={2}
                  value={form.outcome_notes}
                  onChange={e => setForm({ ...form, outcome_notes: e.target.value })}
                  placeholder="Record interim updates or final completion review..."
                  className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 border border-white/10 text-slate-300 rounded-xl font-medium hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-bold hover:from-indigo-500 hover:to-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                >
                  {isAddModalOpen ? 'Create Intervention' : 'Update Intervention'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
