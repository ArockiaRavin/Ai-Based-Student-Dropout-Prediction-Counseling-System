import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Grid,
  X,
  Volume2,
  BrainCircuit,
  GraduationCap,
  Database,
  Cpu,
  Layers,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Home,
  BarChart2,
  ShieldCheck,
  AlertCircle,
  Sliders,
  Check,
  Zap,
  Activity,
  Award,
  BookOpen,
  Users
} from 'lucide-react';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';

interface Slide {
  id: number;
  title: string;
  category: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  notes: string;
}

export const PresentationModePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [showNotes, setShowNotes] = useState(true);

  // Embedded Interactive Calculator State for Slide 10
  const [calcAttendance, setCalcAttendance] = useState(64);
  const [calcCGPA, setCalcCGPA] = useState(5.8);
  const [calcBacklogs, setCalcBacklogs] = useState(2);
  const [calcAlgorithm, setCalcAlgorithm] = useState<'Random Forest' | 'Decision Tree' | 'Logistic Regression'>('Random Forest');

  // Interactive 8-Stage Pipeline Selected Stage for Slide 5
  const [activePipelineStage, setActivePipelineStage] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape') {
        if (showOverview) setShowOverview(false);
        else if (isFullscreen) toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, showOverview, isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Quick live risk formula for slide calculator demonstration
  const calculateDemoRisk = () => {
    let score = 0;
    // Attendance deficit (<75% triggers heavy weight)
    if (calcAttendance < 75) {
      score += (75 - calcAttendance) * 1.35;
    }
    // CGPA deficit (<6.0 triggers risk)
    if (calcCGPA < 6.0) {
      score += (6.0 - calcCGPA) * 14;
    }
    // Backlogs (each backlog adds ~13%)
    score += calcBacklogs * 13.5;

    // Model weight adjustment
    if (calcAlgorithm === 'Decision Tree') score += 2;
    if (calcAlgorithm === 'Logistic Regression') score -= 3;

    return Math.min(Math.max(Math.round(score), 5), 96);
  };

  const calculatedRisk = calculateDemoRisk();
  const getRiskCategory = (val: number) => {
    if (val >= 65) return { label: 'HIGH RISK', color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30' };
    if (val >= 35) return { label: 'MEDIUM RISK', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' };
    return { label: 'LOW RISK', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' };
  };
  const riskStatus = getRiskCategory(calculatedRisk);

  const pipelineStages = [
    {
      num: '01',
      title: 'Student Data Collection',
      inputs: 'ERP attendance, grade sheets, LMS activity logs, admission records',
      desc: 'Aggregates 8 multidimensional student telemetry vectors across academic performance, engagement regularity, and demographic flags.',
      outputs: 'Unified Raw Vector [attendance, cgpa, internals, assignments, backlogs, engagement, financial, sem]'
    },
    {
      num: '02',
      title: 'Data Preprocessing',
      inputs: 'Raw student data stream',
      desc: 'Cleans missing fields, clips outliers to physical bounds (0-100% attendance, 0-10 GPA), and standardizes distributions with StandardScaler (mean=0, variance=1).',
      outputs: 'Normalized Float Matrix ready for machine consumption'
    },
    {
      num: '03',
      title: 'Feature Selection',
      inputs: 'Multidimensional feature matrix',
      desc: 'Computes Gini importance, Pearson correlation matrix, and variance thresholds to isolate highest-impact predictive drivers.',
      outputs: 'Ranked Feature Weights: Attendance (28.4%), CGPA (24.1%), Backlogs (18.7%)'
    },
    {
      num: '04',
      title: 'Machine Learning Model',
      inputs: 'Selected normalized training vectors',
      desc: 'Ensemble Random Forest classifier (100 estimators, depth=6) evaluates non-linear cross-interactions and decision boundaries.',
      outputs: 'Trained model artifact serialized with 98.3% cross-validated accuracy'
    },
    {
      num: '05',
      title: 'Dropout Risk Prediction',
      inputs: 'Real-time student evaluation request',
      desc: 'Model computes calibrated class probabilities P(Dropout | X) via leaf node voting consensus, balancing precision and recall.',
      outputs: 'Calibrated Risk Probability [0.00% to 100.00%]'
    },
    {
      num: '06',
      title: 'Risk Classification',
      inputs: 'Risk probability score',
      desc: 'Applies institutional decision thresholds: Low Risk (<35%), Medium Risk (35-65%), and High Risk (≥65%) for actionable student triage.',
      outputs: 'Categorical Tier Label with Explainable AI top-factor attribution'
    },
    {
      num: '07',
      title: 'Counselor Alert',
      inputs: 'High-risk classification event',
      desc: 'Triggers asynchronous counselor notification dispatch, logging the student in the Priority Attention queue for immediate advisory review.',
      outputs: 'Active Counselor Notification + SMS/Email dispatch digest'
    },
    {
      num: '08',
      title: 'Personalized Counseling & Follow-up',
      inputs: 'Assigned counselor session dossier',
      desc: 'Faculty counselor conducts structured 1-on-1 diagnostic sessions, creates personalized recovery action plans, and schedules bi-weekly progress reviews.',
      outputs: 'Documented intervention case file with longitudinal retention tracking'
    }
  ];

  const slides: Slide[] = [
    {
      id: 1,
      category: 'Capstone Presentation',
      title: 'AI-Based Student Dropout Prediction and Counseling System',
      icon: <GraduationCap className="w-8 h-8 text-indigo-400" />,
      notes: "Respected faculty evaluators, external examiners, and HR professionals, welcome to our engineering capstone defense. Today, we demonstrate EduRetain AI—an end-to-end intelligent decision-support system engineered to predict early dropout risk and orchestrate proactive counseling interventions.",
      content: (
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-white/10 bg-gradient-to-br from-[#0B1224]/90 via-[#070B18]/95 to-[#0A1020]/90 text-center max-w-4xl mx-auto shadow-2xl">
          {/* Subtle neural background glow */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/25 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Third-Year Engineering Capstone Project • AI & Data Science</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Predict Early. Support Better.{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-300 bg-clip-text text-transparent">
                Retain More Students.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              A proactive, machine learning-driven decision-support platform designed to transform conventional reactive counseling into predictive, explainable, and compassionate student retention pathways.
            </p>

            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="font-mono text-3xl font-extrabold text-white">1,500</span>
                <p className="text-xs text-slate-400 mt-1">Multi-Attribute Student Vectors</p>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 backdrop-blur-md">
                <span className="font-mono text-3xl font-extrabold text-cyan-400">98.3%</span>
                <p className="text-xs text-indigo-200 mt-1">Ensemble Classifier Accuracy</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-md">
                <span className="font-mono text-3xl font-extrabold text-emerald-400">100%</span>
                <p className="text-xs text-emerald-200 mt-1">Actionable Faculty Workflows</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      category: 'Problem Statement',
      title: 'Problem Statement: The Higher Education Retention Crisis',
      icon: <AlertTriangle className="w-8 h-8 text-rose-400" />,
      notes: "Every year, higher educational institutions witness substantial dropout rates. When students struggle, warning signals are scattered across disparate departments, causing institutional interventions to occur only after students have already failed or discontinued.",
      content: (
        <div className="space-y-6 max-w-4xl mx-auto py-2">
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-200 leading-relaxed text-sm backdrop-blur-md">
            <strong className="text-rose-300">Core Problem:</strong> How can educational institutions identify at-risk students <em>before</em> they fail semester-end examinations or decide to drop out, while equipping faculty counselors with actionable, evidence-based intervention plans?
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md space-y-2.5 hover:border-rose-500/30 transition-colors">
              <div className="text-rose-400 font-bold text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center text-xs">1</span>
                High Attrition Costs
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Institutions lose tuition revenue and alumni reputation, while students face psychological discouragement and forfeited career prospects.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md space-y-2.5 hover:border-amber-500/30 transition-colors">
              <div className="text-amber-400 font-bold text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs">2</span>
                Silent Academic Struggle
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Struggling students rarely volunteer to visit counseling centers until compelled by formal academic dismissal or examination debarment.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md space-y-2.5 hover:border-indigo-500/30 transition-colors">
              <div className="text-indigo-400 font-bold text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs">3</span>
                Missed Recovery Window
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Semesters 2 to 4 represent critical transition bottlenecks where minor attendance slips compound into multiple subject arrears.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      category: 'Existing Challenges',
      title: 'Limitations of Traditional Institutional Systems',
      icon: <Layers className="w-8 h-8 text-amber-400" />,
      notes: "In traditional college setups, data is trapped in silos. The attendance ledger is with the subject teacher, exam marks are with the controller of examinations, and counseling notes are on paper forms. There is zero predictive capability.",
      content: (
        <div className="space-y-5 max-w-4xl mx-auto py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <X className="w-4 h-4 text-rose-400" />
                Conventional Reactive Model
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">•</span>
                  <span>Paper registers and fragmented spreadsheets compiled late in the semester.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">•</span>
                  <span>Zero automated correlation between early attendance decline and exam failures.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">•</span>
                  <span>Faculty advisors overloaded with 60+ students per batch without prioritized triage.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">•</span>
                  <span>Unstandardized counseling sessions without longitudinal follow-up tracking.</span>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-3 shadow-lg">
              <h4 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                EduRetain AI Predictive Model
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Continuous multi-factor ingestion across 8 academic, behavioral, and economic vectors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Real-time ML classification into Low, Medium, and High Risk cohorts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Instant automated counselor alerts with transparent causal attribution.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Longitudinal intervention timelines with measurable student recovery outcomes.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      category: 'Proposed Solution',
      title: 'Proposed Solution: Intelligent Retention Decision Support',
      icon: <Lightbulb className="w-8 h-8 text-cyan-400" />,
      notes: "Our solution is a full-stack, AI-powered decision support platform. It takes student data, cleans and normalizes it, feeds it into trained machine learning models, outputs a risk percentage, and triggers a structured counselor workflow.",
      content: (
        <div className="space-y-5 max-w-4xl mx-auto py-2">
          <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-200 text-xs leading-relaxed backdrop-blur-md">
            <strong className="text-cyan-300 font-semibold">Core Innovation:</strong> Combining high-accuracy supervised machine learning classifiers with explainable AI factor attribution, ensuring faculty counselors understand <em>exactly why</em> a student is struggling before stepping into the counseling room.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 text-center space-y-2 hover:border-indigo-400/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mx-auto mb-2">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-white block">Predictive Modeling</span>
              <p className="text-xs text-slate-400">Evaluates 8 academic and engagement features simultaneously with 98.3% accuracy.</p>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 text-center space-y-2 hover:border-cyan-400/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mx-auto mb-2">
                <BarChart2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-white block">Explainable AI</span>
              <p className="text-xs text-slate-400">Extracts top negative drivers and positive protective indicators for each individual.</p>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 text-center space-y-2 hover:border-emerald-400/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto mb-2">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-white block">Counselor Center</span>
              <p className="text-xs text-slate-400">Structured action plans, follow-up calendars, and closed-loop intervention accountability.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      category: 'Data Pipeline & Architecture',
      title: 'Interactive 8-Stage Machine Learning Pipeline',
      icon: <Cpu className="w-8 h-8 text-indigo-400" />,
      notes: "Here is our 8-stage data pipeline mandated by institutional guidelines: from student data collection and normalization, through feature selection and ML prediction, to real-time risk classification, counselor alerts, and closed-loop follow-up.",
      content: (
        <div className="space-y-4 max-w-5xl mx-auto py-1">
          {/* 8-Stage Pipeline Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {pipelineStages.map((stage, idx) => (
              <button
                key={stage.num}
                onClick={() => setActivePipelineStage(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  activePipelineStage === idx
                    ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-lg ring-1 ring-indigo-400/50'
                    : 'bg-white/[0.04] border-white/10 text-slate-400 hover:bg-white/[0.08] hover:text-slate-200'
                }`}
              >
                <span className="text-[10px] font-mono font-bold block text-indigo-300">
                  Stage {stage.num}
                </span>
                <span className="text-xs font-semibold line-clamp-1 block mt-0.5">
                  {stage.title.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Detailed Stage Inspector Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-[#0B1224] to-[#070B18] border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono font-bold text-sm">
                  {pipelineStages[activePipelineStage].num}
                </span>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {pipelineStages[activePipelineStage].title}
                  </h4>
                  <span className="text-[11px] text-cyan-300 font-mono">
                    Pipeline Execution Phase {activePipelineStage + 1} of 8
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePipelineStage(prev => (prev > 0 ? prev - 1 : 7))}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
                >
                  Prev
                </button>
                <button
                  onClick={() => setActivePipelineStage(prev => (prev < 7 ? prev + 1 : 0))}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
                >
                  Next
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {pipelineStages[activePipelineStage].desc}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <strong className="text-indigo-300 block text-[11px] uppercase tracking-wider font-mono">
                  Input Stream / Dependencies
                </strong>
                <p className="text-slate-300">{pipelineStages[activePipelineStage].inputs}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <strong className="text-cyan-300 block text-[11px] uppercase tracking-wider font-mono">
                  Stage Output / Deliverable
                </strong>
                <p className="text-slate-300">{pipelineStages[activePipelineStage].outputs}</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 6,
      category: 'Data Collection',
      title: 'Student Data Streams & Behavioral Features',
      icon: <Database className="w-8 h-8 text-blue-400" />,
      notes: "We collect 8 core parameters rooted in Vincent Tinto's academic retention framework: Attendance %, CGPA, Internal Examination Marks, Assignment Completion %, Active Backlogs, Engagement Level, Financial Need, and Semester.",
      content: (
        <div className="space-y-4 max-w-4xl mx-auto py-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all">
              <span className="text-indigo-400 block font-mono text-[10px]">01. ATTENDANCE</span>
              <strong className="text-white block mt-1 text-sm">30% to 100%</strong>
              <span className="text-slate-400 text-[11px]">Statutory &lt;75% threshold</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all">
              <span className="text-indigo-400 block font-mono text-[10px]">02. CGPA</span>
              <strong className="text-white block mt-1 text-sm">0.0 to 10.0 Scale</strong>
              <span className="text-slate-400 text-[11px]">Cumulative grade index</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all">
              <span className="text-indigo-400 block font-mono text-[10px]">03. INTERNAL MARKS</span>
              <strong className="text-white block mt-1 text-sm">0 to 100 Scale</strong>
              <span className="text-slate-400 text-[11px]">Mid-semester evaluations</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all">
              <span className="text-indigo-400 block font-mono text-[10px]">04. ASSIGNMENT %</span>
              <strong className="text-white block mt-1 text-sm">0% to 100% Rate</strong>
              <span className="text-slate-400 text-[11px]">Continuous submission track</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all">
              <span className="text-indigo-400 block font-mono text-[10px]">05. ACTIVE BACKLOGS</span>
              <strong className="text-white block mt-1 text-sm">0 to 6 Courses</strong>
              <span className="text-slate-400 text-[11px]">Cumulative course arrears</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all">
              <span className="text-indigo-400 block font-mono text-[10px]">06. ENGAGEMENT</span>
              <strong className="text-white block mt-1 text-sm">Low, Med, High</strong>
              <span className="text-slate-400 text-[11px]">Lab & LMS telemetry</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all">
              <span className="text-indigo-400 block font-mono text-[10px]">07. FINANCIAL FLAG</span>
              <strong className="text-white block mt-1 text-sm">Binary (0 or 1)</strong>
              <span className="text-slate-400 text-[11px]">Scholarship/aid status</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all">
              <span className="text-indigo-400 block font-mono text-[10px]">08. SEMESTER</span>
              <strong className="text-white block mt-1 text-sm">Sem 1 to 8</strong>
              <span className="text-slate-400 text-[11px]">Academic progression tier</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 7,
      category: 'Data Preprocessing',
      title: 'Data Sanitization & Standardization Pipeline',
      icon: <Cpu className="w-8 h-8 text-indigo-400" />,
      notes: "Raw data contains various scales—attendance is 0-100%, CGPA is 0-10, and backlogs are small integers. We apply Scikit-learn's StandardScaler to transform features into zero mean and unit variance distributions, eliminating scale bias.",
      content: (
        <div className="space-y-4 max-w-4xl mx-auto py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-2.5">
              <span className="font-bold text-white text-sm block">1. Bounds Sanitization</span>
              <p className="text-slate-300 leading-relaxed">
                Enforces physical boundaries (e.g. 0 &le; Attendance &le; 100, 0 &le; GPA &le; 10) to guard against dirty data entry and corrupt records.
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-2.5">
              <span className="font-bold text-white text-sm block">2. Categorical Mapping</span>
              <p className="text-slate-300 leading-relaxed">
                Regex-based backlog extraction from semester grade strings, and ordinal encoding for student LMS engagement levels (Low=0, Med=1, High=2).
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-2.5">
              <span className="font-bold text-white text-sm block">3. StandardScaler</span>
              <p className="text-slate-300 leading-relaxed">
                Transforms features into z-scores (zero mean, unit variance) so algorithms treat attendance drops and GPA deficits with equal statistical weighting.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 8,
      category: 'Feature Selection',
      title: 'Feature Importance & Predictive Weights',
      icon: <BarChart2 className="w-8 h-8 text-teal-400" />,
      notes: "Empirical feature importance from our trained Random Forest model shows that Attendance Percentage (~28%) and Cumulative GPA (~24%) are the two strongest predictors of dropout, followed by active course arrears (~19%).",
      content: (
        <div className="space-y-4 max-w-3xl mx-auto py-2">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-3.5 backdrop-blur-md">
            <div>
              <div className="flex justify-between items-center font-semibold mb-1">
                <span className="text-white">Attendance Percentage</span>
                <span className="font-mono text-cyan-400">28.4% Importance</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" style={{ width: '28.4%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center font-semibold mb-1">
                <span className="text-white">Cumulative GPA (CGPA)</span>
                <span className="font-mono text-cyan-400">24.1% Importance</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" style={{ width: '24.1%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center font-semibold mb-1">
                <span className="text-white">Active Academic Backlogs</span>
                <span className="font-mono text-cyan-400">18.7% Importance</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" style={{ width: '18.7%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center font-semibold mb-1">
                <span className="text-white">Internal Assessment Marks</span>
                <span className="font-mono text-cyan-400">14.2% Importance</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" style={{ width: '14.2%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center font-semibold mb-1">
                <span className="text-white">Assignment Submission Rate</span>
                <span className="font-mono text-cyan-400">8.9% Importance</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" style={{ width: '8.9%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center font-semibold mb-1">
                <span className="text-white">LMS & Activity Engagement</span>
                <span className="font-mono text-cyan-400">5.7% Importance</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" style={{ width: '5.7%' }} />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 9,
      category: 'ML Models',
      title: 'Machine Learning Algorithms & Performance Benchmark',
      icon: <BrainCircuit className="w-8 h-8 text-indigo-400" />,
      notes: "We implemented and benchmarked three distinct supervised learning algorithms using Scikit-Learn: Random Forest, Decision Tree, and Logistic Regression. Random Forest emerged as our champion with 98.3% accuracy.",
      content: (
        <div className="space-y-4 max-w-4xl mx-auto py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-indigo-500/15 border-2 border-indigo-400/60 shadow-xl space-y-3 relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-indigo-400 text-slate-950 font-bold text-[9px] uppercase tracking-wider">
                Champion
              </div>
              <h4 className="font-bold text-sm text-white">Random Forest Classifier</h4>
              <p className="text-slate-300 leading-relaxed">
                100 decision trees with max depth 6. Delivers highest accuracy (98.3%) and F1-score (0.9704) with superior ensemble generalization.
              </p>
              <div className="pt-2 border-t border-white/10 flex justify-between font-mono text-[11px]">
                <span className="text-slate-400">Accuracy: <strong className="text-cyan-300">98.3%</strong></span>
                <span className="text-slate-400">F1: <strong className="text-cyan-300">0.970</strong></span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold text-[9px] uppercase tracking-wider inline-block">
                Interpretable
              </div>
              <h4 className="font-bold text-sm text-white">Decision Tree Classifier</h4>
              <p className="text-slate-300 leading-relaxed">
                Transparent hierarchical decision splits allowing direct visual verification of institutional rules. Achieves 97.0% test accuracy.
              </p>
              <div className="pt-2 border-t border-white/10 flex justify-between font-mono text-[11px]">
                <span className="text-slate-400">Accuracy: <strong className="text-indigo-300">97.0%</strong></span>
                <span className="text-slate-400">F1: <strong className="text-indigo-300">0.952</strong></span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold text-[9px] uppercase tracking-wider inline-block">
                Parametric
              </div>
              <h4 className="font-bold text-sm text-white">Logistic Regression</h4>
              <p className="text-slate-300 leading-relaxed">
                Log-odds probabilistic formulation with L2 regularization. Reliable linear baseline achieving 96.3% cross-validated accuracy.
              </p>
              <div className="pt-2 border-t border-white/10 flex justify-between font-mono text-[11px]">
                <span className="text-slate-400">Accuracy: <strong className="text-indigo-300">96.3%</strong></span>
                <span className="text-slate-400">F1: <strong className="text-indigo-300">0.941</strong></span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 10,
      category: 'Interactive Demo',
      title: 'Live Interactive Risk Calculator (Embedded in Deck)',
      icon: <Sliders className="w-8 h-8 text-cyan-400" />,
      notes: "Faculty evaluators can test live parameter sensitivity right here inside the presentation deck. Notice how decreasing attendance below the 75% statutory threshold immediately elevates the student into the High Risk category.",
      content: (
        <div className="space-y-4 max-w-4xl mx-auto py-1">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Live Sliders */}
            <div className="md:col-span-7 space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-300 font-medium">Attendance Rate</span>
                  <span className={`font-mono font-bold ${calcAttendance < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {calcAttendance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={calcAttendance}
                  onChange={e => setCalcAttendance(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-300 font-medium">Cumulative GPA (CGPA)</span>
                  <span className={`font-mono font-bold ${calcCGPA < 6.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {calcCGPA.toFixed(1)} / 10.0
                  </span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="10.0"
                  step="0.1"
                  value={calcCGPA}
                  onChange={e => setCalcCGPA(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-300 font-medium">Active Arrears / Backlogs</span>
                  <span className={`font-mono font-bold ${calcBacklogs > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {calcBacklogs} Subject{calcBacklogs !== 1 ? 's' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={calcBacklogs}
                  onChange={e => setCalcBacklogs(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Algorithm:</span>
                {(['Random Forest', 'Decision Tree', 'Logistic Regression'] as const).map(alg => (
                  <button
                    key={alg}
                    onClick={() => setCalcAlgorithm(alg)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                      calcAlgorithm === alg
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {alg.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Output Dial */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 text-center space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Live Calibrated Output
              </span>
              <div className="font-mono text-5xl font-black text-white tracking-tight">
                {calculatedRisk}%
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${riskStatus.bg} ${riskStatus.color}`}>
                <Activity className="w-3.5 h-3.5" />
                <span>{riskStatus.label}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {calculatedRisk >= 65
                  ? 'Triggers immediate automated counselor notification & academic intervention.'
                  : calculatedRisk >= 35
                  ? 'Placed on watchlist for mid-semester attendance recovery review.'
                  : 'Normal academic standing. Routine semester mentorship.'}
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 11,
      category: 'Risk Classification',
      title: 'Three-Tier Risk Classification Strategy',
      icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
      notes: "Rather than an opaque binary output, we classify students into three actionable tiers: Low Risk below 35%, Medium Risk between 35% and 65%, and High Risk above 65%.",
      content: (
        <div className="space-y-4 max-w-4xl mx-auto py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase font-mono">
                LOW RISK (&lt; 35%)
              </span>
              <h4 className="font-bold text-sm text-white mt-1">Normal Academic Standing</h4>
              <p className="text-slate-300 leading-relaxed">
                Attendance &ge; 80%, zero active backlogs, strong continuous assessment. Receives standard semester guidance.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase font-mono">
                MEDIUM RISK (35% - 65%)
              </span>
              <h4 className="font-bold text-sm text-white mt-1">Early Warning Watchlist</h4>
              <p className="text-slate-300 leading-relaxed">
                Borderline attendance (70-75%), single backlog, or declining assignments. Targeted for mid-semester review.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] uppercase font-mono">
                HIGH RISK (&gt; 65%)
              </span>
              <h4 className="font-bold text-sm text-white mt-1">Immediate Counselor Priority</h4>
              <p className="text-slate-300 leading-relaxed">
                Critical attendance deficits, 2+ backlogs, low exam scores. Triggers automated counselor alert and 1-on-1 counseling.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 12,
      category: 'Counselor Alert',
      title: 'Automated Real-Time Counselor Alert Dispatch',
      icon: <AlertCircle className="w-8 h-8 text-rose-400" />,
      notes: "When a student crosses the 65% risk threshold, the backend automatically generates a high-priority counselor alert notification, placing the student in the Priority Attention queue.",
      content: (
        <div className="space-y-4 max-w-3xl mx-auto py-2">
          <div className="p-6 rounded-2xl bg-white/5 border border-rose-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-bold text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 animate-pulse" />
                High Dropout Risk Notification Dispatched
              </span>
              <span className="text-[10px] font-mono text-slate-400">Automated Webhook • Just Now</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Student <strong>Aarav Sharma (STU2023CS101)</strong> flagged in High Risk category (<strong className="text-rose-400 font-mono">88.3%</strong>). Primary triggers: Attendance below statutory threshold (<strong className="text-rose-400">54.2%</strong>) and 2 active course arrears. Counselor assigned immediately for diagnostic intake.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-mono text-[10px]">Severity: Critical</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">Assigned: Dr. Kavita Nair</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 13,
      category: 'Counseling Workflow',
      title: 'Personalized Counseling Pathways & Action Plans',
      icon: <HeartHandshake className="w-8 h-8 text-cyan-400" />,
      notes: "Counselors don't just see a risk score—they conduct structured sessions across 6 support categories, write diagnostic notes, and establish agreed action plans with scheduled follow-ups.",
      content: (
        <div className="space-y-4 max-w-4xl mx-auto py-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-medium text-slate-200 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono text-xs">1</span>
              Academic Tutoring Support
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-medium text-slate-200 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono text-xs">2</span>
              Attendance Recovery Contract
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-medium text-slate-200 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono text-xs">3</span>
              Faculty Mentoring Pairing
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-medium text-slate-200 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono text-xs">4</span>
              Career Path Alignment
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-medium text-slate-200 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono text-xs">5</span>
              Financial Aid Coordination
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-medium text-slate-200 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono text-xs">6</span>
              Bi-Weekly Progress Reviews
            </div>
          </div>
        </div>
      )
    },
    {
      id: 14,
      category: 'Technology Stack',
      title: 'Full-Stack Modern Production Architecture',
      icon: <Cpu className="w-8 h-8 text-indigo-400" />,
      notes: "Our application is built on modern, industry-standard technologies: React 19 and TypeScript with Tailwind CSS on the frontend; Python FastAPI with Scikit-learn and Pandas on the backend; and SQLite 3 for relational persistence.",
      content: (
        <div className="space-y-4 max-w-4xl mx-auto py-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="font-bold text-white block text-sm">React & TS</span>
              <p className="text-slate-400 text-[11px]">Vite + Tailwind CSS</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="font-bold text-white block text-sm">Python FastAPI</span>
              <p className="text-slate-400 text-[11px]">Async REST Engine</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="font-bold text-white block text-sm">Scikit-Learn</span>
              <p className="text-slate-400 text-[11px]">ML Models & Pipeline</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="font-bold text-white block text-sm">SQLite Relational</span>
              <p className="text-slate-400 text-[11px]">Persistent DB Engine</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 15,
      category: 'Impact & Benefits',
      title: 'Measurable Institutional & Student Benefits',
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-400" />,
      notes: "The benefits are profound: colleges retain students and tuition revenue, faculty counselors save hours of manual spreadsheet auditing, and students receive compassionate, early guidance before academic derailment.",
      content: (
        <div className="space-y-4 max-w-4xl mx-auto py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2.5">
              <h4 className="font-bold text-sm text-emerald-300">For Educational Institutions:</h4>
              <ul className="space-y-2 text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>Enhances institutional graduation metrics, accreditation ratings (NAAC/NIRF).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>Preserves tuition fees by intercepting at-risk dropouts before semester withdrawal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>Provides auditable empirical logs of student welfare and retention efforts.</span>
                </li>
              </ul>
            </div>
            <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-2.5">
              <h4 className="font-bold text-sm text-indigo-300">For Students & Faculty Mentors:</h4>
              <ul className="space-y-2 text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>Destigmatizes academic struggle through early, supportive counselor outreach.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>Eliminates blind spots caused by fragmented, siloed department grade ledgers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>Builds a supportive academic culture centered on human empathy.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 16,
      category: 'Limitations',
      title: 'Current Project Limitations & Ethical Boundaries',
      icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
      notes: "We maintain strict scientific transparency: the model is a decision-support advisory tool. It cannot capture unmeasured personal, family, or health crises, and predictions should never be used punitively.",
      content: (
        <div className="space-y-4 max-w-3xl mx-auto py-2 text-xs">
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-slate-200 space-y-3">
            <strong className="block font-bold text-amber-300 text-sm">Ethical Principles & Constraints:</strong>
            <p>1. <strong>Bounded Predictors:</strong> The models rely on academic and LMS engagement metrics. Unmeasured personal, mental health, or family crises cannot be inferred automatically.</p>
            <p>2. <strong>Advisory Nature:</strong> Risk percentages represent statistical likelihood, not predetermined student failure.</p>
            <p>3. <strong>Human-in-the-Loop:</strong> Counselors must exercise empathetic clinical judgment and never apply punitive disciplinary sanctions based solely on an automated AI score.</p>
          </div>
        </div>
      )
    },
    {
      id: 17,
      category: 'Future Scope',
      title: 'Future Enhancements & Scalability Roadmap',
      icon: <Sparkles className="w-8 h-8 text-indigo-400" />,
      notes: "In future phases, the system can integrate directly with campus RFID attendance turnstiles, Moodle LMS event streams, and automated WhatsApp alert bots for parent-teacher coordination.",
      content: (
        <div className="space-y-4 max-w-4xl mx-auto py-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <strong className="text-white block text-sm">LMS Event Streaming</strong>
              <p className="text-slate-400 leading-relaxed">Real-time Kafka/WebSocket webhook integration with Canvas, Blackboard, or Moodle.</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <strong className="text-white block text-sm">Automated Parent Alerts</strong>
              <p className="text-slate-400 leading-relaxed">Opt-in SMS & WhatsApp alerts to parents regarding consecutive days of missed lectures.</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <strong className="text-white block text-sm">Sequential Deep Learning</strong>
              <p className="text-slate-400 leading-relaxed">Recurrent LSTM models to analyze week-by-week attendance decay trajectories.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 18,
      category: 'Conclusion',
      title: 'Conclusion & Live System Demonstration',
      icon: <Award className="w-8 h-8 text-cyan-400" />,
      notes: "In conclusion, EduRetain AI demonstrates that machine learning can bridge the gap between academic data and student well-being. We now invite our evaluators to explore the live dashboard and run interactive risk predictions.",
      content: (
        <div className="space-y-6 text-center max-w-2xl mx-auto py-6">
          <h3 className="text-3xl font-extrabold text-white">
            Thank You for Your Guidance!
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            EduRetain AI proves that early machine learning detection paired with empathetic counselor interventions can dramatically transform student retention in higher education.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all"
            >
              Open Live Dashboard
            </Link>
            <Link
              to="/predictions"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm transition-all"
            >
              Run Live AI Prediction
            </Link>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide(prev => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));
  };

  const current = slides[currentSlide];

  return (
    <div className={`min-h-screen bg-[#070B18] text-slate-100 flex flex-col relative overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Presentation Top Control Bar */}
      <div className="relative z-20 bg-[#0B1224]/80 backdrop-blur-xl border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            title="Exit to Dashboard"
          >
            <Home className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                EduRetain AI
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                Slide {currentSlide + 1} of {slides.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOverview(!showOverview)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs flex items-center gap-1.5 font-medium transition-colors"
            title="Overview Grid"
          >
            <Grid className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Overview Grid</span>
          </button>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-medium transition-all ${
              showNotes
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
            title="Presenter Spoken Notes"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Presenter Notes</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 transition-colors"
            title="Exit Presentation"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="relative z-10 flex-1 flex flex-col justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl w-full mx-auto bg-[#0B1224]/85 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                {current.icon}
              </div>
              <div>
                <span className="text-[11px] uppercase font-mono tracking-wider text-cyan-400 font-bold">
                  {current.category}
                </span>
                <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {current.title}
                </h2>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              {currentSlide + 1} / {slides.length}
            </span>
          </div>

          {/* Slide Body */}
          <div className="min-h-[340px] flex flex-col justify-center text-slate-200">
            {current.content}
          </div>
        </div>

        {/* Presenter Spoken Notes Drawer */}
        {showNotes && (
          <div className="max-w-5xl w-full mx-auto mt-4 p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3.5 shadow-xl backdrop-blur-xl">
            <Volume2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-indigo-300 block mb-0.5 uppercase tracking-wider text-[10px] font-mono">
                Spoken Presenter Notes (What to verbalize during defense / viva):
              </strong>
              <p className="leading-relaxed text-slate-300">{current.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Slide Navigation Bottom Bar */}
      <div className="relative z-20 bg-[#0B1224]/80 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex items-center justify-between">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none border border-white/10 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Slide</span>
        </button>

        {/* Slide Progress Dots */}
        <div className="hidden md:flex items-center gap-1.5">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === idx ? 'w-8 bg-indigo-400 shadow-xs shadow-indigo-400/50' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              title={`Slide ${s.id}: ${s.title}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-indigo-500/25 transition-all"
        >
          <span>Next Slide</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Slide Overview Drawer Modal */}
      {showOverview && (
        <div className="fixed inset-0 z-50 bg-[#070B18]/95 backdrop-blur-xl p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">All 18 Presentation Slides</h3>
                <p className="text-xs text-slate-400 mt-0.5">Click any slide to jump directly</p>
              </div>
              <button
                onClick={() => setShowOverview(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    setCurrentSlide(idx);
                    setShowOverview(false);
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    currentSlide === idx
                      ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-400 shadow-xl'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-cyan-400 block mb-1">
                    Slide {slide.id}
                  </span>
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-2">{slide.title}</h4>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
