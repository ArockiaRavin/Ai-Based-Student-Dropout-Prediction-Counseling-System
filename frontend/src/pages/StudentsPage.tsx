import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';
import { api } from '../api';
import { Student, RiskCategory } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { useAuth } from '../context/AuthContext';

export const StudentsPage: React.FC = () => {
  const { canEditStudents, canDeleteStudents } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [semester, setSemester] = useState<string>('All');
  const [riskLevel, setRiskLevel] = useState('All');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    department: 'Computer Science & Engineering',
    semester: 3,
    attendance_pct: 75.0,
    gpa: 7.0,
    internal_marks: 60.0,
    assignment_completion_pct: 75.0,
    previous_semester_result: 'Pass - 0 Backlogs',
    engagement_level: 'Medium',
    financial_support_needed: 0,
    status: 'Enrolled'
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [search, department, semester, riskLevel, sortBy, sortOrder]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getStudents({
        search: search.trim() || undefined,
        department: department !== 'All' ? department : undefined,
        semester: semester !== 'All' ? parseInt(semester) : undefined,
        risk_level: riskLevel !== 'All' ? riskLevel : undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setStudents(res.students || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      console.error(err);
      showNotification('Failed to fetch students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createStudent(formData);
      showNotification('Student profile created and risk predicted!', 'success');
      setIsAddModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      showNotification(err.message || 'Creation failed', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateStudent(formData.student_id, formData);
      showNotification('Student record updated successfully!', 'success');
      setIsEditModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      showNotification(err.message || 'Update failed', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    try {
      await api.deleteStudent(selectedStudent.student_id);
      showNotification(`Student ${selectedStudent.student_id} removed`, 'success');
      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err: any) {
      showNotification(err.message || 'Deletion failed', 'error');
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      department: student.department,
      semester: student.semester,
      attendance_pct: student.attendance_pct,
      gpa: student.gpa,
      internal_marks: student.internal_marks,
      assignment_completion_pct: student.assignment_completion_pct,
      previous_semester_result: student.previous_semester_result,
      engagement_level: student.engagement_level,
      financial_support_needed: student.financial_support_needed,
      status: student.status
    });
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    const randomId = `STU2024CS${Math.floor(200 + Math.random() * 800)}`;
    setFormData({
      student_id: randomId,
      first_name: '',
      last_name: '',
      email: '',
      department: 'Computer Science & Engineering',
      semester: 3,
      attendance_pct: 78.0,
      gpa: 7.2,
      internal_marks: 65.0,
      assignment_completion_pct: 80.0,
      previous_semester_result: 'Pass - 0 Backlogs',
      engagement_level: 'Medium',
      financial_support_needed: 0,
      status: 'Enrolled'
    });
    setIsAddModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.importStudentsCsv(file);
      showNotification(res.message || 'CSV imported successfully!', 'success');
      setIsImportModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      showNotification(err.message || 'Failed to import CSV', 'error');
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold backdrop-blur-xl animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Users className="w-6 h-6" />
            </div>
            Student Cohort Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, filter, edit, and import student academic and behavioral profiles with real-time risk predictions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={api.getExportCsvUrl()}
            download="student_retention_records.csv"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold shadow-md transition-all backdrop-blur-md"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </a>

          {canEditStudents && (
            <>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold shadow-md transition-all backdrop-blur-md"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Import CSV</span>
              </button>

              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by student name, roll number, or email..."
              className="w-full bg-[#0B1224] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:bg-white/[0.06] focus:border-indigo-500/50 focus:outline-none"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full bg-[#0B1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 font-medium"
            >
              {departmentsList.map(d => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              value={semester}
              onChange={e => setSemester(e.target.value)}
              className="w-full bg-[#0B1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 font-medium"
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s.toString()}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={riskLevel}
              onChange={e => setRiskLevel(e.target.value)}
              className="w-full bg-[#0B1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 font-medium"
            >
              <option value="All">All Risk Tiers</option>
              <option value="HIGH RISK">High Risk Only</option>
              <option value="MEDIUM RISK">Medium Risk Only</option>
              <option value="LOW RISK">Low Risk Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
          <span>
            Showing <strong className="text-white">{students.length}</strong> of <strong className="text-white">{total}</strong> students matching telemetry criteria
          </span>
          {(search || department !== 'All' || semester !== 'All' || riskLevel !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setDepartment('All');
                setSemester('All');
                setRiskLevel('All');
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Students Data Table */}
      <div className="glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-400">Loading student records...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No students found</h4>
            <p className="text-xs text-slate-400">Try adjusting your search criteria or resetting filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-slate-300 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
                <tr>
                  <th
                    onClick={() => handleSort('student_id')}
                    className="py-3.5 px-4 cursor-pointer hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Student ID</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3.5 px-4 cursor-pointer hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Name &amp; Email</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Department / Sem</th>
                  <th
                    onClick={() => handleSort('attendance')}
                    className="py-3.5 px-4 text-center cursor-pointer hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Attendance</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('gpa')}
                    className="py-3.5 px-4 text-center cursor-pointer hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>CGPA</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center">Marks &amp; Backlogs</th>
                  <th
                    onClick={() => handleSort('risk_score')}
                    className="py-3.5 px-4 cursor-pointer hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>ML Risk Tier</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map(st => {
                  const pred = st.latest_prediction;
                  return (
                    <tr key={st.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                        {st.student_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/students/${st.student_id}`}
                          className="font-bold text-white hover:text-cyan-300 transition-colors"
                        >
                          {st.first_name} {st.last_name}
                        </Link>
                        <div className="text-[11px] text-slate-400 font-mono">{st.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-medium text-white">{st.department}</div>
                        <div className="text-[10px] text-slate-400">Semester {st.semester}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span
                          className={`font-bold ${
                            st.attendance_pct < 75.0 ? 'text-[#FB7185]' : 'text-[#34D399]'
                          }`}
                        >
                          {st.attendance_pct}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                        {st.gpa.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[11px]">
                        <div>Internal: <span className="font-mono font-bold text-cyan-300">{st.internal_marks}</span></div>
                        <div className="text-slate-400 font-medium">{st.previous_semester_result}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {pred ? (
                          <RiskBadge category={pred.risk_category} score={pred.risk_score} size="sm" />
                        ) : (
                          <span className="text-slate-500 text-xs font-mono">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/students/${st.student_id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06] transition-colors"
                            title="View Student 360 Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {canEditStudents && (
                            <button
                              onClick={() => openEditModal(st)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-white/[0.06] transition-colors"
                              title="Edit Record"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {canDeleteStudents && (
                            <button
                              onClick={() => {
                                setSelectedStudent(st);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* ADD / EDIT STUDENT MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel rounded-3xl border border-white/20 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
              <h3 className="font-bold text-base text-white">
                {isAddModalOpen ? 'Add New Student Record' : `Edit Student: ${formData.student_id}`}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleCreateSubmit : handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Student Roll Number / ID *</label>
                  <input
                    type="text"
                    required
                    disabled={isEditModalOpen}
                    value={formData.student_id}
                    onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 font-mono text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    {departmentsList.filter(d => d !== 'All').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Current Semester *</label>
                  <select
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <span className="font-bold text-white block mb-2">Academic &amp; Behavioral Metrics</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Attendance (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={formData.attendance_pct}
                      onChange={e => setFormData({ ...formData, attendance_pct: parseFloat(e.target.value) })}
                      className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2 font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Cumulative GPA (0-10)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={formData.gpa}
                      onChange={e => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
                      className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2 font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Internal Marks (0-100)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={formData.internal_marks}
                      onChange={e => setFormData({ ...formData, internal_marks: parseFloat(e.target.value) })}
                      className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2 font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Assignment (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={formData.assignment_completion_pct}
                      onChange={e => setFormData({ ...formData, assignment_completion_pct: parseFloat(e.target.value) })}
                      className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2 font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-slate-400 mb-1">Previous Result / Backlogs</label>
                  <select
                    value={formData.previous_semester_result}
                    onChange={e => setFormData({ ...formData, previous_semester_result: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="Pass - 0 Backlogs">Pass - 0 Backlogs</option>
                    <option value="Pass - 1 Backlog">Pass - 1 Backlog</option>
                    <option value="Fail - 2 Backlogs">Fail - 2 Backlogs</option>
                    <option value="Fail - 3 Backlogs">Fail - 3 Backlogs</option>
                    <option value="Pass - Distinction">Pass - Distinction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Engagement Level</label>
                  <select
                    value={formData.engagement_level}
                    onChange={e => setFormData({ ...formData, engagement_level: e.target.value })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="High">High (Active Lab &amp; LMS)</option>
                    <option value="Medium">Medium (Average)</option>
                    <option value="Low">Low (Passive / Disengaged)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Financial Support Need</label>
                  <select
                    value={formData.financial_support_needed}
                    onChange={e => setFormData({ ...formData, financial_support_needed: parseInt(e.target.value) })}
                    className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value={0}>No Financial Hardship</option>
                    <option value={1}>Yes (Scholarship / Aid Needed)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold hover:from-indigo-500 hover:to-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                >
                  {isAddModalOpen ? 'Save & Run AI Prediction' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {isDeleteModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-panel rounded-3xl border border-rose-500/30 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(251,113,133,0.3)]">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-white">Delete Student Record?</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-white">{selectedStudent.first_name} {selectedStudent.last_name}</strong> ({selectedStudent.student_id})? This will permanently remove all associated prediction history, counseling notes, and intervention records.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/[0.05]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-[0_0_15px_rgba(251,113,133,0.4)]"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-panel rounded-3xl border border-white/20 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                Import Students from CSV
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Upload a CSV file containing columns: <code className="text-cyan-300 font-mono text-[11px]">student_id, first_name, last_name, department, semester, attendance_pct, gpa, internal_marks, assignment_completion_pct</code>. Each student will automatically be evaluated through the active ML prediction pipeline.
            </p>
            <div className="border-2 border-dashed border-white/15 rounded-2xl p-6 text-center hover:bg-white/[0.04] transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
