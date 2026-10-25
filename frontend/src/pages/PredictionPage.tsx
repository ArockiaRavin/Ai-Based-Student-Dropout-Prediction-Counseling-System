import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  ArrowRight,
  RotateCcw,
  Info,
  Layers,
  History,
  TrendingDown,
  Cpu,
  Save,
  Check
} from 'lucide-react';
import { api } from '../api';
import { PredictionRecord, Student } from '../types';
import { RiskBadge } from '../components/RiskBadge';

export const PredictionPage: React.FC = () => {
  const [modelName, setModelName] = useState('Random Forest');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Form State
  const [attendance, setAttendance] = useState<number>(62.0);
  const [gpa, setGpa] = useState<number>(5.4);
  const [internalMarks, setInternalMarks] = useState<number>(45.0);
  const [assignmentCompletion, setAssignmentCompletion] = useState<number>(50.0);
  const [previousResult, setPreviousResult] = useState<string>('Fail - 2 Backlogs');
  const [engagement, setEngagement] = useState<string>('Low');
  const [financialSupport, setFinancialSupport] = useState<number>(1);
  const [semester, setSemester] = useState<number>(3);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Quick preset archetypes for faculty demonstration
  const loadPreset = (presetType: 'high' | 'med' | 'low') => {
    if (presetType === 'high') {
      setAttendance(54.0);
      setGpa(4.60);
      setInternalMarks(38.0);
      setAssignmentCompletion(40.0);
      setPreviousResult('Fail - 2 Backlogs');
      setEngagement('Low');
      setFinancialSupport(1);
      setSemester(3);
    } else if (presetType === 'med') {
      setAttendance(72.0);
      setGpa(6.40);
      setInternalMarks(56.0);
      setAssignmentCompletion(68.0);
      setPreviousResult('Pass - 1 Backlog');
      setEngagement('Medium');
      setFinancialSupport(0);
      setSemester(4);
    } else {
      setAttendance(92.0);
      setGpa(8.75);
      setInternalMarks(84.0);
      setAssignmentCompletion(95.0);
      setPreviousResult('Pass - Distinction');
      setEngagement('High');
      setFinancialSupport(0);
      setSemester(6);
    }
    setResult(null);
    setSavedSuccess(false);
  };

  useEffect(() => {
    api.getStudents().then(res => setStudents(res.students || [])).catch(() => {});
  }, []);

  const handleSelectExistingStudent = (id: string) => {
    setSelectedStudentId(id);
    const found = students.find(s => s.student_id === id);
    if (found) {
      setAttendance(found.attendance_pct);
      setGpa(found.gpa);
      setInternalMarks(found.internal_marks);
      setAssignmentCompletion(found.assignment_completion_pct);
      setPreviousResult(found.previous_semester_result);
      setEngagement(found.engagement_level);
      setFinancialSupport(found.financial_support_needed);
      setSemester(found.semester);
      setResult(null);
      setSavedSuccess(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSavedSuccess(false);

      const payload = {
        student_id: selectedStudentId || undefined,
        attendance_pct: attendance,
        gpa: gpa,
        internal_marks: internalMarks,
        assignment_completion_pct: assignmentCompletion,
        previous_semester_result: previousResult,
        engagement_level: engagement,
        financial_support_needed: financialSupport,
        semester: semester,
        model_name: modelName
      };

      const res = await api.runPrediction(payload);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <BrainCircuit className="w-6 h-6" />
            </div>
            AI Dropout Risk Prediction Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Input multi-factor student telemetry to compute calibrated dropout probability, risk categorization, and counselor interventions.
          </p>
        </div>

        {/* Algorithm Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 font-mono">MODEL:</span>
          <select
            value={modelName}
            onChange={e => setModelName(e.target.value)}
            className="bg-[#0B1224] border border-white/15 rounded-xl px-3.5 py-2 text-xs font-semibold text-cyan-300 shadow-md focus:outline-none focus:border-indigo-500/50"
          >
            <option value="Random Forest">Random Forest (Champion Ensemble)</option>
            <option value="Decision Tree">Decision Tree Classifier</option>
            <option value="Logistic Regression">Logistic Regression</option>
            <option value="Rule-Based Heuristic Baseline">Rule-Based Baseline (Heuristic)</option>
          </select>
        </div>
      </div>

      {/* Preset Buttons for Demonstration */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg">
        <span className="font-semibold text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Demonstration Quick Profiles:
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadPreset('high')}
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-[#FB7185] border border-rose-500/30 hover:bg-rose-500/25 font-semibold transition-all shadow-[0_0_10px_rgba(251,113,133,0.15)]"
          >
            High Risk Case (Attendance &amp; Backlogs)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('med')}
            className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-[#FBBF24] border border-amber-500/30 hover:bg-amber-500/25 font-semibold transition-all shadow-[0_0_10px_rgba(251,191,36,0.15)]"
          >
            Medium Risk Case (Borderline Standing)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('low')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-[#34D399] border border-emerald-500/30 hover:bg-emerald-500/25 font-semibold transition-all shadow-[0_0_10px_rgba(52,211,153,0.15)]"
          >
            Low Risk Case (Distinction Cohort)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Input Features */}
        <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-white/10 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-sm text-white">Student Predictor Input Vector</h3>
            {/* Optional existing student selection */}
            <select
              value={selectedStudentId}
              onChange={e => handleSelectExistingStudent(e.target.value)}
              className="text-xs bg-[#0B1224] border border-white/15 rounded-xl p-2 text-slate-300 max-w-[200px] focus:outline-none focus:border-indigo-500/50"
            >
              <option value="">-- Load Existing Student --</option>
              {students.slice(0, 30).map(s => (
                <option key={s.student_id} value={s.student_id}>
                  {s.first_name} {s.last_name} ({s.student_id})
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4 text-xs">
            {/* Attendance slider */}
            <div>
              <div className="flex justify-between font-medium text-slate-300 mb-1.5">
                <span>Classroom Attendance Compliance (%)</span>
                <span className={`font-mono font-bold ${attendance < 75 ? 'text-[#FB7185]' : 'text-[#34D399]'}`}>
                  {attendance}%
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="0.5"
                value={attendance}
                onChange={e => setAttendance(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
                <span>Critical (&lt;60%)</span>
                <span>Warning (75%)</span>
                <span>Optimal (85%+)</span>
              </div>
            </div>

            {/* GPA slider */}
            <div>
              <div className="flex justify-between font-medium text-slate-300 mb-1.5">
                <span>Cumulative GPA / CGPA (0.00 - 10.00)</span>
                <span className="font-mono font-bold text-white">{gpa.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="10.0"
                step="0.05"
                value={gpa}
                onChange={e => setGpa(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Internal Marks & Assignment Completion */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Internal Examination Marks (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={internalMarks}
                  onChange={e => setInternalMarks(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 font-mono text-white focus:bg-white/[0.08] focus:border-indigo-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Assignment Completion Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={assignmentCompletion}
                  onChange={e => setAssignmentCompletion(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 font-mono text-white focus:bg-white/[0.08] focus:border-indigo-500/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Previous Result & Semester */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Previous Semester Result &amp; Backlogs
                </label>
                <select
                  value={previousResult}
                  onChange={e => setPreviousResult(e.target.value)}
                  className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white focus:border-indigo-500/50 focus:outline-none"
                >
                  <option value="Pass - Distinction">Pass - Distinction (0 Backlogs)</option>
                  <option value="Pass - First Class">Pass - First Class (0 Backlogs)</option>
                  <option value="Pass - 1 Backlog">Pass - 1 Active Backlog</option>
                  <option value="Fail - 2 Backlogs">Fail - 2 Active Backlogs</option>
                  <option value="Fail - 3 Backlogs">Fail - 3+ Active Backlogs</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Current Academic Semester
                </label>
                <select
                  value={semester}
                  onChange={e => setSemester(parseInt(e.target.value))}
                  className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white focus:border-indigo-500/50 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Engagement & Financial Flag */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Classroom &amp; LMS Engagement Level
                </label>
                <select
                  value={engagement}
                  onChange={e => setEngagement(e.target.value)}
                  className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white focus:border-indigo-500/50 focus:outline-none"
                >
                  <option value="High">High (Proactive, regular LMS logins)</option>
                  <option value="Medium">Medium (Average course participation)</option>
                  <option value="Low">Low (Sporadic access, disengaged)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Financial / Scholarship Indicator
                </label>
                <select
                  value={financialSupport}
                  onChange={e => setFinancialSupport(parseInt(e.target.value))}
                  className="w-full bg-[#0B1224] border border-white/10 rounded-xl p-2.5 text-white focus:border-indigo-500/50 focus:outline-none"
                >
                  <option value={0}>No financial distress reported</option>
                  <option value={1}>Flagged financial pressure / Fee installment</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 mt-2 hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <BrainCircuit className="w-5 h-5 animate-spin text-cyan-300" />
                  <span>Evaluating Risk Model...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5 text-cyan-300" />
                  <span>Analyze Student Risk ({modelName})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Panel: Prediction Results */}
        <div className="lg:col-span-6 space-y-6">
          {!result ? (
            <div className="glass-card rounded-2xl border-2 border-dashed border-white/15 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                <BrainCircuit className="w-8 h-8 text-cyan-400/80" />
              </div>
              <h4 className="font-bold text-base text-white">Awaiting Prediction Execution</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Adjust the student predictors on the left or select a demonstration preset, then click <strong>"Analyze Student Risk"</strong> to compute inference results.
              </p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-white/15 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
              {/* Result Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Model Evaluation Result
                  </span>
                  <div className="flex items-center gap-3 mt-1.5">
                    <RiskBadge category={result.risk_category} size="lg" />
                    <span className="text-3xl font-mono font-extrabold text-white">
                      {result.risk_score}%
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-400 block text-[10px] font-mono">Algorithm Used</span>
                  <span className="font-semibold text-cyan-300 bg-cyan-500/15 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                    {result.model_used}
                  </span>
                </div>
              </div>

              {/* Model Rationale / Explanation */}
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block mb-1">Explainable AI Reasoning:</strong>
                {result.explanation}
              </div>

              {/* Factors & Positive Indicators */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1.5">
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#FB7185]" />
                    Contributing Risk Factors:
                  </span>
                  <ul className="space-y-1 text-xs text-rose-200">
                    {result.factors.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#FB7185] font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
                    Protective Positive Indicators:
                  </span>
                  <ul className="space-y-1 text-xs text-emerald-200">
                    {result.positive_indicators.map((p: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399] shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Next Steps */}
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/25 space-y-2">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-cyan-400" />
                  Recommended Counselor Next Steps:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.recommendations.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setSavedSuccess(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold hover:bg-white/[0.05] transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Run Another Assessment</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSavedSuccess(true)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    savedSuccess
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                  }`}
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#34D399]" />
                      <span>Record Saved to Database</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Record to Database</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
